import type { PoFile, TranslationEntry } from "./types";

export class PoParser {
  static parse(content: string): PoFile {
    const lines = content.split("\n");
    const entries: TranslationEntry[] = [];
    let currentEntry: Partial<TranslationEntry> = {};
    let inMsgid = false;
    let inMsgstr = false;
    let header: any = {};
    let isHeader = true;
    let comments: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) {
        if (currentEntry.msgid || currentEntry.msgstr) {
          this.finishEntry(currentEntry, entries, comments);
          currentEntry = {};
          comments = [];
          inMsgid = false;
          inMsgstr = false;
        }
        continue;
      }

      // Comments
      if (line.startsWith("#")) {
        comments.push(line);
        continue;
      }

      // msgid
      if (line.startsWith("msgid ")) {
        inMsgid = true;
        inMsgstr = false;
        currentEntry.msgid = this.parseString(line.substring(6));
        currentEntry.line = i + 1;

        // Check if this is the header
        if (isHeader && currentEntry.msgid === "") {
          // This is the header entry
          continue;
        }
        isHeader = false;
        continue;
      }

      // msgstr
      if (line.startsWith("msgstr ")) {
        inMsgstr = true;
        inMsgid = false;
        const msgstr = this.parseString(line.substring(7));
        currentEntry.msgstr = msgstr;

        // Parse header if this is the first entry
        if (isHeader && currentEntry.msgid === "") {
          header = this.parseHeader(msgstr);
          isHeader = false;
          currentEntry = {};
          continue;
        }
        continue;
      }

      // Continuation lines
      if (line.startsWith('"') && line.endsWith('"')) {
        const continuationText = this.parseString(line);
        if (inMsgid) {
          currentEntry.msgid = (currentEntry.msgid || "") + continuationText;
        } else if (inMsgstr) {
          currentEntry.msgstr = (currentEntry.msgstr || "") + continuationText;
        }
        continue;
      }
    }

    // Finish last entry
    if (currentEntry.msgid || currentEntry.msgstr) {
      this.finishEntry(currentEntry, entries, comments);
    }

    return {
      header: header,
      entries: entries,
    };
  }

  private static finishEntry(
    currentEntry: Partial<TranslationEntry>,
    entries: TranslationEntry[],
    comments: string[]
  ) {
    if (currentEntry.msgid) {
      entries.push({
        msgid: currentEntry.msgid,
        msgstr: currentEntry.msgstr || "",
        comments: comments.length > 0 ? [...comments] : undefined,
        line: currentEntry.line,
      });
    }
  }

  private static parseString(str: string): string {
    // Remove quotes and handle escape sequences
    if (str.startsWith('"') && str.endsWith('"')) {
      return str
        .slice(1, -1)
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
    }
    return str;
  }

  private static parseHeader(headerStr: string): any {
    const header: any = {};
    const lines = headerStr.split("\\n");

    for (const line of lines) {
      if (line.includes(": ")) {
        const [key, value] = line.split(": ", 2);
        header[key] = value;
      }
    }

    return header;
  }

  static serialize(poFile: PoFile): string {
    let content = "";

    // Add header
    content += 'msgid ""\n';
    content += 'msgstr ""\n';

    // Add header fields
    for (const [key, value] of Object.entries(poFile.header)) {
      content += `"${key}: ${value}\\n"\n`;
    }
    content += "\n";

    // Add entries
    for (const entry of poFile.entries) {
      // Add comments
      if (entry.comments) {
        for (const comment of entry.comments) {
          content += comment + "\n";
        }
      }

      // Add msgid
      content += `msgid "${this.escapeString(entry.msgid)}"\n`;

      // Add msgstr
      content += `msgstr "${this.escapeString(entry.msgstr)}"\n`;

      content += "\n";
    }

    return content;
  }

  private static escapeString(str: string): string {
    return str
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\t/g, "\\t");
  }
}
