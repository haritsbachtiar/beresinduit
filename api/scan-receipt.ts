import Anthropic from '@anthropic-ai/sdk'
import type { VercelRequest, VercelResponse } from '@vercel/node'

type TransactionType = 'pemasukan' | 'pengeluaran'

type ScanResult = {
  amount: number
  description: string
  categoryId: string
  date: string
  type: TransactionType
}

type RequestBody = {
  imageBase64: string
  mimeType: string
}

const VALID_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const
type ValidMimeType = (typeof VALID_MIME_TYPES)[number]

function isValidMimeType(mime: string): mime is ValidMimeType {
  return (VALID_MIME_TYPES as readonly string[]).includes(mime)
}

const CATEGORY_IDS = [
  'gaji', 'freelance', 'investasi', 'hadiah', 'lain-in',
  'makanan', 'transport', 'belanja', 'kesehatan', 'hiburan',
  'pendidikan', 'tagihan', 'lain-out',
]

const SYSTEM_PROMPT = `Kamu adalah asisten keuangan yang menganalisis foto struk/nota belanja.
Ekstrak informasi transaksi dari gambar dan kembalikan HANYA JSON yang valid.`

const USER_PROMPT = `Analisis gambar struk/nota ini dan ekstrak data transaksi.

Kembalikan HANYA JSON valid dengan struktur ini persis:
{
  "amount": <angka bulat dalam IDR, tanpa desimal>,
  "description": <string pendek dalam Bahasa Indonesia, maks 60 karakter>,
  "categoryId": <salah satu dari: gaji, freelance, investasi, hadiah, lain-in, makanan, transport, belanja, kesehatan, hiburan, pendidikan, tagihan, lain-out>,
  "date": <format YYYY-MM-DD, gunakan hari ini jika tidak jelas>,
  "type": <"pemasukan" atau "pengeluaran">
}

Aturan:
- amount harus bilangan bulat positif (IDR, tanpa sen)
- Struk/nota biasanya "pengeluaran"
- Pilih categoryId yang paling sesuai
- Kembalikan HANYA objek JSON, tanpa teks lain`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY tidak dikonfigurasi' })
  }

  const body = req.body as Partial<RequestBody>

  if (!body?.imageBase64 || typeof body.imageBase64 !== 'string') {
    return res.status(400).json({ error: 'imageBase64 diperlukan' })
  }

  if (!body?.mimeType || typeof body.mimeType !== 'string') {
    return res.status(400).json({ error: 'mimeType diperlukan' })
  }

  if (!isValidMimeType(body.mimeType)) {
    return res.status(400).json({ error: 'Format gambar tidak didukung. Gunakan JPEG, PNG, atau WebP.' })
  }

  try {
    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: body.mimeType as ValidMimeType,
                data: body.imageBase64,
              },
            },
            {
              type: 'text',
              text: USER_PROMPT,
            },
          ],
        },
      ],
    })

    const textContent = message.content.find(c => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return res.status(500).json({ error: 'Tidak dapat membaca respons AI' })
    }

    const raw = textContent.text.trim()
    const jsonString = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const result = JSON.parse(jsonString) as ScanResult

    if (
      typeof result.amount !== 'number' ||
      !Number.isInteger(result.amount) ||
      result.amount <= 0 ||
      typeof result.description !== 'string' ||
      !result.categoryId ||
      !CATEGORY_IDS.includes(result.categoryId) ||
      !result.date ||
      !/^\d{4}-\d{2}-\d{2}$/.test(result.date) ||
      result.type !== 'pemasukan' && result.type !== 'pengeluaran'
    ) {
      return res.status(422).json({ error: 'Tidak dapat membaca struk dengan akurat. Coba foto ulang.' })
    }

    return res.status(200).json({
      amount: result.amount,
      description: result.description.slice(0, 100),
      categoryId: result.categoryId,
      date: result.date,
      type: result.type,
    } satisfies ScanResult)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(422).json({ error: 'Tidak dapat membaca struk. Pastikan foto jelas dan coba lagi.' })
    }
    return res.status(500).json({ error: 'Terjadi kesalahan saat memproses struk' })
  }
}
