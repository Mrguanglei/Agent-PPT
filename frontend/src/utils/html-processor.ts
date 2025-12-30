/**
 * HTML processing utilities for slides
 */

export class HTMLProcessor {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitize(html: string): string {
    // Basic sanitization - remove script tags and event handlers
    return html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<[^>]+on\w+="[^"]*"[^>]*>/gi, (match) => {
        return match.replace(/on\w+="[^"]*"/gi, '');
      })
      .replace(/<[^>]+on\w+='[^']*'[^>]*>/gi, (match) => {
        return match.replace(/on\w+='[^']*'/gi, '');
      });
  }

  /**
   * Extract text content from HTML
   */
  static extractText(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = this.sanitize(html);
    return div.textContent || div.innerText || '';
  }

  /**
   * Generate slide HTML with proper styling
   */
  static generateSlideHTML(
    content: string,
    styles: Record<string, any> = {},
    isCover: boolean = false
  ): string {
    const defaultStyles = {
      background: '#FEFEFE',
      primary: '#44B54B',
      accent: '#1399FF',
      fontFamily: "'MiSans', sans-serif",
      fontSize: '24px',
    };

    const finalStyles = { ...defaultStyles, ...styles };

    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.cn.font.mi.com/font/css?family=MiSans:300,400,500,600,700:Chinese_Simplify,Latin&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: ${finalStyles.fontFamily};
            background: ${finalStyles.background};
            color: ${finalStyles.primary};
            line-height: 1.6;
          }
          .slide {
            width: 1280px;
            min-height: 720px;
            position: relative;
            overflow: hidden;
            ${isCover ? 'display: flex; align-items: center; justify-content: center;' : ''}
          }
          h1 {
            color: ${finalStyles.primary};
            font-size: ${isCover ? '60px' : '40px'};
            font-weight: 600;
            margin-bottom: ${isCover ? '20px' : '15px'};
          }
          h2 {
            color: ${finalStyles.primary};
            font-size: 32px;
            font-weight: 500;
            margin-bottom: 12px;
          }
          p {
            color: ${finalStyles.primary};
            font-size: ${finalStyles.fontSize};
            margin-bottom: 12px;
          }
          .accent { color: ${finalStyles.accent}; }
          .material-icons {
            color: ${finalStyles.primary};
            font-size: 28px;
            margin-right: 8px;
          }
        </style>
      </head>
      <body>
        <div class="slide">
          ${this.sanitize(content)}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Create thumbnail from HTML content (placeholder implementation)
   */
  static async createThumbnail(html: string, width: number = 320, height: number = 180): Promise<string> {
    // This would typically use a headless browser like Puppeteer
    // For now, return a placeholder
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280" font-size="14">
          Slide Preview
        </text>
      </svg>
    `)}`;
  }

  /**
   * Validate HTML structure
   */
  static validate(html: string): boolean {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      return doc.body.children.length > 0;
    } catch {
      return false;
    }
  }
}
