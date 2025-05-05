/**
 * Detects the programming language of the provided code
 * @param {string} code - The source code to analyze
 * @returns {string} - The detected programming language or 'general' if unknown
 */
export function detectLanguage(code: string): string {
  // Skip detection for very short snippets
  if (!code || code.trim().length < 10) {
    return 'general';
  }

  // Normalize the code for more consistent detection
  const normalizedCode = code.toLowerCase();
  
  // Language patterns with weighted scoring
  const patterns = {
    javascript: [
      { pattern: /\bconst\b|\blet\b|\bvar\b|\bfunction\b|\b=>\b|\bimport\s+[{\w\s,}]+\s+from\b/g, weight: 2 },
      { pattern: /\brequire\(['"]|\bmodule\.exports\b|\bwindow\.|\bdocument\./g, weight: 3 },
      { pattern: /\breact\b|\bvue\b|\bangular\b|\bnpm\b|\bnode\b|\bjsx\b/g, weight: 2 },
      { pattern: /\bconsole\.log\b|\bsetTimeout\b|\bpromise\b|\basync\b|\bawait\b/g, weight: 1 }
    ],
    typescript: [
      { pattern: /\binterface\b|\btype\b|\benum\b|\bnamespace\b|\bas\s+[\w<>]+/g, weight: 3 },
      { pattern: /:[\s]*[\w<>\[\]{}|]+|<[\w<>\[\]{}|,\s]+>/g, weight: 2 },
      { pattern: /\bimport\s+[{\w\s,}]+\s+from\b|\bexport\s+/g, weight: 1 },
      { pattern: /\bReadonly<|\bPartial<|\bPick<|\bRecord<|\bRequired</g, weight: 3 }
    ],
    python: [
      { pattern: /\bdef\s+[\w_]+\s*\(|\bclass\s+[\w_]+[\(:]|\bimport\s+[\w_]+|\bfrom\s+[\w_.]+\s+import\b/g, weight: 3 },
      { pattern: /:\s*$|\bindent|\bself\.|\bif\s+__name__\s*==\s*['"]__main__['"]:/g, weight: 2 },
      { pattern: /\bprint\s*\(|\brange\s*\(|\blen\s*\(|\bdict\s*\(|\blist\s*\(/g, weight: 1 }
    ],
    java: [
      // Java-specific imports and packages (very strong indicators)
      { pattern: /\bimport\s+java\.|\bimport\s+javax\.|\bimport\s+org\.springframework\.|\bpackage\s+[\w\.]+;/g, weight: 4 },
      // Java-specific syntax patterns
      { pattern: /\bpublic\s+class\b|\bprivate\s+|\bprotected\s+|\bextends\b|\bimplements\b|\binterface\s+[A-Z][\w_]*\b/g, weight: 3 },
      // Java standard library and patterns
      { pattern: /\bSystem\.out\.print|\bString\b|\bInteger\b|\bBoolean\b|\bArrayList<|\bHashMap<|\bList<|\bMap<|\bException\b/g, weight: 3 },
      // Java annotations (unique to Java)
      { pattern: /@Override\b|@Autowired\b|@Component\b|@Service\b|@Repository\b|@Entity\b|@Table\b/g, weight: 4 },
      // Java variable declarations and patterns
      { pattern: /\bfinal\s+[A-Z][\w_]*<|\bvoid\b|\bstatic\b|\bfinal\b|\bsuper\.|\bthis\.|\bnew\s+[A-Z][\w<>]+\s*\(/g, weight: 2 },
      // Patterns that help distinguish from C#
      { pattern: /\breturn\s+null;|\bthrows\s+[A-Z][\w_]+(Exception)?|\btry\s*\{|\bcatch\s*\([A-Z][\w_]+(Exception)?/g, weight: 2 }
    ],
    cpp: [
      { pattern: /\b#include\s*<[\w.]+>|\bstd::|\bnamespace\s+[\w:]+\s*\{|\btemplate\s*<|\bclass\s+[\w_]+\s*[:{]/g, weight: 3 },
      { pattern: /\bint\s+main\s*\(|\bvector<|\bconst\s+[\w_]+&|\bauto\b|\bcout\s*<<|\bcin\s*>>/g, weight: 2 },
      { pattern: /\bvoid\b|\bint\b|\bfloat\b|\bdouble\b|\bchar\b|\bbool\b|\bstruct\b/g, weight: 1 }
    ],
    csharp: [
      // C#-specific imports and namespaces (very strong indicators)
      { pattern: /\busing\s+System\.|\busing\s+Microsoft\.|\bnamespace\s+[\w\.]+;/g, weight: 4 },
      // C#-specific syntax patterns
      { pattern: /\bpublic\s+class\b|\bprivate\s+|\bprotected\s+|\bnamespace\s+[\w\.]+|\bclass\s+[\w_]+\s*[:{]|\binterface\s+I[A-Z][\w_]*\b/g, weight: 2 },
      // C# specific keywords (not found or rare in Java)
      { pattern: /\bvar\b|\bdynamic\b|\bstring\b|\bdecimal\b|\bobject\b|\bdelegate\b|\bevent\b|\busing\s*\(/g, weight: 3 },
      // C# standard library and patterns
      { pattern: /\bConsole\.Write|\bList<|\bDictionary<|\bIEnumerable<|\bLINQ\b|\bfrom\s+\w+\s+in\s+/g, weight: 3 },
      // C# attributes (unique to C#)
      { pattern: /\[\w+\]|\[Required\]|\[HttpGet\]|\[Authorize\]|\[Route\]/g, weight: 4 },
      // C# async patterns and lambda expressions
      { pattern: /\basync\s+Task<|\bawait\s+|\bTask\.Run\(|=>\s*\{|=>\s*\w+/g, weight: 3 },
      // Patterns that help distinguish from Java
      { pattern: /\bforeach\s*\(|\bswitch\s*\(|\bdefault:|\bcase\s+[\w\.]+:/g, weight: 2 }
    ],
    php: [
      { pattern: /\b<\?php|\b\?>|\b\$[a-zA-Z_][a-zA-Z0-9_]*|\becho\b|\bfunction\s+[\w_]+\s*\(/g, weight: 3 },
      { pattern: /\barray\s*\(|\b=>\b|\bforeach\s*\(|\binclude\b|\brequire\b/g, weight: 2 }
    ],
    ruby: [
      { pattern: /\bdef\s+[\w_]+|\bclass\s+[A-Z][\w_]*|\bmodule\s+[A-Z][\w_]*|\bend\b|\battr_/g, weight: 3 },
      { pattern: /\bdo\s*\|[^|]*\||\bputs\b|\brequire\b|\binclude\b|\bnil\b|\bhash\b/g, weight: 2 }
    ],
    go: [
      { pattern: /\bpackage\s+[\w_]+|\bimport\s+\(|\bfunc\s+[\w_]+|\btype\s+[\w_]+\s+struct\b/g, weight: 3 },
      { pattern: /\bgo\s+func|\bchan\b|\bdefer\b|\bselect\b|\bgoroutine\b|\bmake\s*\(/g, weight: 2 }
    ],
    rust: [
      { pattern: /\bfn\s+[\w_]+|\blet\s+mut\b|\bstruct\s+[\w_]+|\benum\s+[\w_]+|\bimpl\b|\bpub\b/g, weight: 3 },
      { pattern: /\bRust\b|\bcargo\b|\bOption<|\bResult<|\bvec!|\bmatch\b|\b->\b/g, weight: 2 }
    ],
    swift: [
      { pattern: /\bfunc\s+[\w_]+|\bvar\s+[\w_]+\s*:|\blet\s+[\w_]+\s*:|\bclass\s+[A-Z][\w_]*|\bstruct\s+[A-Z][\w_]*/g, weight: 3 },
      { pattern: /\bguard\s+|\bif\s+let\b|\boptional\b|\bUIKit\b|\bSwift\b|\bNSObject\b/g, weight: 2 }
    ]
  };

  // Calculate scores for each language
  const scores: Record<string, number> = {};
  
  for (const [language, patternList] of Object.entries(patterns)) {
    scores[language] = 0;
    
    for (const { pattern, weight } of patternList) {
      const matches = normalizedCode.match(pattern);
      if (matches) {
        scores[language] += matches.length * weight;
      }
    }
  }

  // Find the language with the highest score
  let bestLanguage = 'general';
  let highestScore = 0;
  
  for (const [language, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestLanguage = language;
    }
  }

  // If the highest score is too low, default to general
  if (highestScore < 3) {
    return 'general';
  }
  
  return bestLanguage;
}

/**
 * Maps language identifiers to Monaco Editor language IDs
 * @param {string} language - The detected language
 * @returns {string} - The Monaco Editor language ID
 */
export function getMonacoLanguage(language: string): string {
  const languageMap: Record<string, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    csharp: 'csharp',
    php: 'php',
    ruby: 'ruby',
    go: 'go',
    rust: 'rust',
    swift: 'swift',
    general: 'javascript' // Default to JavaScript for unknown languages
  };
  
  return languageMap[language] || 'javascript';
}
