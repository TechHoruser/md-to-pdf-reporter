export type Command = {
  name: string;
  description: string;
};

export const KNOWN_COMMANDS: Command[] = [
  { name: '/new-page', description: 'Inserta un salto de página' },
];

export const KNOWN_COMMAND_NAMES = new Set(KNOWN_COMMANDS.map((c) => c.name));
