export const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', monaco: 'javascript', extensions: ['js', 'mjs', 'cjs'], icon: '🟨' },
  { id: 'typescript', name: 'TypeScript', monaco: 'typescript', extensions: ['ts', 'tsx'], icon: '🔷' },
  { id: 'python', name: 'Python', monaco: 'python', extensions: ['py'], icon: '🐍' },
  { id: 'java', name: 'Java', monaco: 'java', extensions: ['java'], icon: '☕' },
  { id: 'csharp', name: 'C#', monaco: 'csharp', extensions: ['cs'], icon: '🟪' },
  { id: 'cpp', name: 'C++', monaco: 'cpp', extensions: ['cpp', 'cc', 'h', 'hpp'], icon: '🟦' },
  { id: 'go', name: 'Go', monaco: 'go', extensions: ['go'], icon: '🐹' },
  { id: 'rust', name: 'Rust', monaco: 'rust', extensions: ['rs'], icon: '🦀' },
  { id: 'php', name: 'PHP', monaco: 'php', extensions: ['php'], icon: '🐘' },
  { id: 'ruby', name: 'Ruby', monaco: 'ruby', extensions: ['rb'], icon: '💎' },
  { id: 'swift', name: 'Swift', monaco: 'swift', extensions: ['swift'], icon: '🕊️' },
  { id: 'kotlin', name: 'Kotlin', monaco: 'kotlin', extensions: ['kt', 'kts'], icon: '🟠' },
  { id: 'html', name: 'HTML', monaco: 'html', extensions: ['html', 'htm'], icon: '🌐' },
  { id: 'css', name: 'CSS', monaco: 'css', extensions: ['css'], icon: '🎨' },
] as const;

export type LanguageId = typeof LANGUAGES[number]['id'];

export const LANG_BY_EXT = Object.fromEntries(
  LANGUAGES.flatMap(l => l.extensions.map(ext => [ext, l.id]))
) as Record<string, LanguageId>;

export const MONACO_BY_ID = Object.fromEntries(LANGUAGES.map(l => [l.id, l.monaco]));
export const ICON_BY_ID = Object.fromEntries(LANGUAGES.map(l => [l.id, l.icon]));
export const NAME_BY_ID = Object.fromEntries(LANGUAGES.map(l => [l.id, l.name]));
