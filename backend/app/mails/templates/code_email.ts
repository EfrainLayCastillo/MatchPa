const IVORY = '#f5f0f0'
const LIME = '#e6fa50'
const DEEP_GREEN = '#003c3c'
const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif"

export interface CodeEmail {
  name: string
  intro: string
  code: string
  ttlMinutes: number
}

export function codeEmailText({ name, intro, code, ttlMinutes }: CodeEmail) {
  return [
    `Hola ${name},`,
    intro,
    `Tu código es: ${code}`,
    `Vence en ${ttlMinutes} minutos.`,
    'Si no fuiste tú, ignora este correo.',
    '— MatchPa',
  ].join('\n\n')
}

/** Table layout with inline styles: Gmail and Outlook ignore <style> blocks and flexbox. */
export function codeEmailHtml({ name, intro, code, ttlMinutes }: CodeEmail) {
  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background:${IVORY};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${IVORY};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:${FONT};color:${DEEP_GREEN};">
<tr><td style="background:${DEEP_GREEN};padding:20px 28px;font-size:24px;font-weight:800;color:${LIME};">MatchPa</td></tr>
<tr><td style="padding:28px 28px 8px;font-size:16px;line-height:1.5;">
<p style="margin:0 0 12px;">Hola ${escapeHtml(name)},</p>
<p style="margin:0;">${escapeHtml(intro)}</p>
</td></tr>
<tr><td align="center" style="padding:20px 28px;">
<div style="display:inline-block;background:${LIME};border-radius:12px;padding:14px 24px;font-size:32px;font-weight:800;letter-spacing:8px;">${code}</div>
</td></tr>
<tr><td style="padding:0 28px 28px;font-size:14px;line-height:1.5;">
<p style="margin:0 0 12px;">Vence en ${ttlMinutes} minutos.</p>
<p style="margin:0;opacity:0.7;">Si no fuiste tú, ignora este correo.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}
