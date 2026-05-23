import { describe, it, expect } from 'vitest'
import { sanitizeHtml, sanitizePlainText } from './sanitize'

describe('sanitizeHtml', () => {
  it('returns plain text unchanged', () => {
    expect(sanitizeHtml('Hello world')).toBe('Hello world')
  })

  it('strips all HTML tags', () => {
    expect(sanitizeHtml('<b>bold</b>')).toBe('bold')
  })

  it('strips script tags and their content', () => {
    const result = sanitizeHtml('<script>alert("xss")</script>')
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert')
  })

  it('strips anchor tags', () => {
    const result = sanitizeHtml('<a href="http://evil.com">click</a>')
    expect(result).not.toContain('<a')
    expect(result).not.toContain('href')
  })

  it('strips img tags', () => {
    const result = sanitizeHtml('<img src="x" onerror="alert(1)">')
    expect(result).not.toContain('<img')
    expect(result).not.toContain('onerror')
  })

  it('strips all attributes from allowed-looking tags', () => {
    const result = sanitizeHtml('<p class="danger" onclick="evil()">text</p>')
    expect(result).not.toContain('class')
    expect(result).not.toContain('onclick')
  })

  it('returns empty string for input containing only tags', () => {
    expect(sanitizeHtml('<div><span></span></div>')).toBe('')
  })

  it('handles empty string', () => {
    expect(sanitizeHtml('')).toBe('')
  })
})

describe('sanitizePlainText', () => {
  it('returns plain text unchanged', () => {
    expect(sanitizePlainText('Hello world')).toBe('Hello world')
  })

  it('encodes < as &lt;', () => {
    expect(sanitizePlainText('<')).toBe('&lt;')
  })

  it('encodes > as &gt;', () => {
    expect(sanitizePlainText('>')).toBe('&gt;')
  })

  it('encodes & as &amp;', () => {
    expect(sanitizePlainText('&')).toBe('&amp;')
  })

  it('encodes " as &quot;', () => {
    expect(sanitizePlainText('"')).toBe('&quot;')
  })

  it("encodes ' as &#x27;", () => {
    expect(sanitizePlainText("'")).toBe('&#x27;')
  })

  it('encodes ` as &#x60;', () => {
    expect(sanitizePlainText('`')).toBe('&#x60;')
  })

  it('neutralises an XSS attempt', () => {
    const result = sanitizePlainText('<script>alert("xss")</script>')
    expect(result).toContain('&lt;script&gt;')
    expect(result).not.toContain('<script>')
  })

  it('handles empty string', () => {
    expect(sanitizePlainText('')).toBe('')
  })

  it('encodes multiple special chars in one string', () => {
    const result = sanitizePlainText('<b>Hello & "world"</b>')
    expect(result).toBe('&lt;b&gt;Hello &amp; &quot;world&quot;&lt;/b&gt;')
  })
})
