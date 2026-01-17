// Turndown - Version 16.0 (Expert Tableaux & Gemini)
const TurndownService = (function() {
  function Turndown() {}

  Turndown.prototype.turndown = function(html) {
    if (!html) return "";
    const container = document.createElement('div');
    container.innerHTML = html;

    const noise = ['button', 'mat-icon', 'svg', '.token-count', '.sr-only', 'style', 'script', '.feedback-icons'];
    container.querySelectorAll(noise.join(',')).forEach(n => n.remove());

    return this.process(container, { listType: null, listIndex: 0 }).trim().replace(/\n{3,}/g, '\n\n');
  };

  Turndown.prototype.process = function(node, state = { listType: null, listIndex: 0 }) {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1) return "";

    const tagName = node.tagName.toLowerCase();
    
    // Blocs de Code
    if (tagName === 'pre') {
      const code = node.querySelector('code') || node;
      return '\n```\n' + code.innerText.trim() + '\n```\n';
    }

    let currentState = { ...state };
    if (tagName === 'ul') currentState = { listType: 'ul', listIndex: 0 };
    if (tagName === 'ol') currentState = { listType: 'ol', listIndex: 0 };

    let children = Array.from(node.childNodes).map(c => this.process(c, currentState)).join('');

    switch(tagName) {
      case 'p': return '\n' + children.trim() + '\n';
      case 'br': return '\n';
      case 'strong': case 'b': return '**' + children.trim() + '**';
      case 'em': case 'i': return '*' + children.trim() + '*';
      case 'h1': return '\n# ' + children.trim() + '\n';
      case 'h2': return '\n## ' + children.trim() + '\n';
      case 'h3': return '\n### ' + children.trim() + '\n';
      case 'hr': return '\n\n---\n\n';
      case 'li': 
        if (state.listType === 'ol') {
          state.listIndex++;
          return '\n' + state.listIndex + '. ' + children.trim();
        }
        return '\n- ' + children.trim();
      
      // --- GESTION AMÉLIORÉE DES TABLEAUX ---
      case 'table': return '\n\n' + children + '\n';
      case 'thead': return children;
      case 'tbody': return children;
      case 'tr': 
        // On récupère toutes les cellules de la ligne
        const cells = Array.from(node.querySelectorAll('th, td'));
        let row = '| ' + children + '\n';
        
        // Si c'est une ligne d'en-tête (contient des TH ou est dans THEAD), on ajoute la ligne de séparation
        const isHeader = node.querySelector('th') || (node.parentElement && node.parentElement.tagName.toLowerCase() === 'thead');
        if (isHeader) {
          row += '| ' + cells.map(() => '---').join(' | ') + ' |\n';
        }
        return row;
      case 'td': case 'th': 
        // On nettoie le contenu de la cellule pour qu'il tienne sur une seule ligne
        return children.trim().replace(/\n/g, ' ') + ' | ';
      
      case 'code': 
        if (node.parentElement && node.parentElement.tagName.toLowerCase() === 'pre') return children;
        return ' `' + children.trim() + '` ';
        
      default: return children;
    }
  };

  return Turndown;
})();
window.TurndownService = TurndownService;