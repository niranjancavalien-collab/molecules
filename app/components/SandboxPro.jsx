import { ArrowRight, Check, Code2, Copy, Cpu, ShieldCheck } from "lucide-react";
import { useCallback, useState } from "react";

import { useTheme } from "~/components/ThemeProvider";
import { Badge, Chip, OutlineButton, PrimaryButton, Reveal, Section } from "~/components/ui";

const CODE_SNIPPET = `import { runSuite } from "@myanatomy/sandbox";

export async function evaluateSubmission(attempt) {
  const sandbox = await runSuite({
    language: attempt.language,
    source: attempt.source,
    memoryLimitMb: 256,
    timeoutMs: 4000,
  });

  const passed = sandbox.tests.filter((t) => t.ok);

  return {
    score: (passed.length / sandbox.tests.length) * 100,
    runtimeMs: sandbox.runtimeMs,
    similarity: await sandbox.plagiarismScan(),
    flags: attempt.proctorEvents.map((e) => e.type),
  };
}`;

const TOKEN_COLORS = {
  base: "#CBD5E1",
  comment: "#64748B",
  string: "#86EFAC",
  keyword: "#C4B5FD",
  number: "#FDBA74",
  fn: "#7DD3FC",
};

const TOKEN_RX =
  /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(import|from|export|async|function|await|const|return|filter|map)\b|\b(\d+)\b|([A-Za-z_$][\w$]*)(?=\()/g;

function tokenize(line) {
  const tokens = [];
  let last = 0;
  let match;
  TOKEN_RX.lastIndex = 0;

  while ((match = TOKEN_RX.exec(line)) !== null) {
    if (match.index > last) tokens.push({ text: line.slice(last, match.index), color: TOKEN_COLORS.base });
    if (match[1]) tokens.push({ text: match[1], color: TOKEN_COLORS.comment });
    else if (match[2]) tokens.push({ text: match[2], color: TOKEN_COLORS.string });
    else if (match[3]) tokens.push({ text: match[3], color: TOKEN_COLORS.keyword });
    else if (match[4]) tokens.push({ text: match[4], color: TOKEN_COLORS.number });
    else if (match[5]) tokens.push({ text: match[5], color: TOKEN_COLORS.fn });
    last = TOKEN_RX.lastIndex;
  }

  if (last < line.length) tokens.push({ text: line.slice(last), color: TOKEN_COLORS.base });
  return tokens;
}

function CopyButton() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(CODE_SNIPPET);
      } else {
        const area = document.createElement("textarea");
        area.value = CODE_SNIPPET;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      setCopied(false);
    }
  }, []);

  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11.5px] transition ${
        copied ? "text-emerald-300" : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy snippet"}
    </button>
  );
}

export function SandboxPro() {
  const { theme } = useTheme();

  return (
    <Section id="sandbox">
      <Reveal>
        <div className="surface-card p-7 sm:p-11">
          <div className="grid grid-cols-1 items-center gap-9 lg:grid-cols-2">
            <div>
              <Chip icon={Code2}>Sandbox Pro</Chip>
              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Real-time cloud IDEs in plain code.
              </h2>
              <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
                Candidates open a browser tab and start typing — no installs, no environment drift.
                Every submission runs against your unit tests inside an isolated container with a
                256 MB memory ceiling and a hard timeout, while proctoring and anti-plagiarism run
                alongside the session.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Badge icon={Cpu}>Zero setup</Badge>
                <Badge icon={Check}>Automated unit tests</Badge>
                <Badge icon={ShieldCheck}>Similarity scan</Badge>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <PrimaryButton icon={ArrowRight}>Launch live demo</PrimaryButton>
                <OutlineButton>View documentation</OutlineButton>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
              <div className="flex items-center gap-2.5 border-b border-white/10 bg-white/[0.03] px-3.5 py-3">
                <span className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                </span>
                <span className="ml-2 rounded-md bg-white/10 px-2.5 py-1 font-mono text-xs text-slate-200">
                  AssessmentRunner.tsx
                </span>
                <span className="ml-auto hidden font-mono text-[11.5px] text-slate-500 sm:inline">
                  {theme === "dark" ? "theme: night-ops" : "theme: daylight"}
                </span>
                <CopyButton />
              </div>

              <pre className="overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-[1.75]">
                {CODE_SNIPPET.split("\n").map((line, index) => (
                  <div key={index} className="flex">
                    <span className="w-8 shrink-0 select-none pr-3.5 text-right text-slate-600">
                      {index + 1}
                    </span>
                    <span className="whitespace-pre">
                      {tokenize(line).map((token, i) => (
                        <span key={i} style={{ color: token.color }}>
                          {token.text}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </pre>

              <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 font-mono text-[11.5px] text-slate-500">
                <span>18 / 18 tests passed</span>
                <span>412 ms · 61 MB</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
