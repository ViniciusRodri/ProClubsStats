import { Panel, SectionTitle } from "@/components/ui/primitives";

type Rule = { title: string; items: string[] };

const SECTIONS: { heading: string; rules: Rule[] }[] = [
  {
    heading: "Formato da competição",
    rules: [
      {
        title: "Fase de grupos",
        items: [
          "8 times divididos em 2 grupos de 4 (Grupo A e Grupo B).",
          "Classificam-se para os playoffs apenas o 1º e o 2º colocado de cada grupo.",
        ],
      },
      {
        title: "Semifinais — MD3",
        items: [
          "Disputadas em melhor de 3 partidas (o primeiro a vencer 2 jogos avança).",
          "Semifinal 1: 1º do Grupo A vs 2º do Grupo B.",
          "Semifinal 2: 1º do Grupo B vs 2º do Grupo A.",
        ],
      },
      {
        title: "Grande Final — MD7",
        items: [
          "Vencedor da Semifinal 1 vs Vencedor da Semifinal 2.",
          "Disputada em melhor de 7 partidas (o primeiro a vencer 4 jogos é o campeão).",
        ],
      },
      {
        title: "Critério de empate nos playoffs",
        items: [
          "Todas as partidas do mata-mata (MD3 e MD7) precisam ter um vencedor.",
          "Empate nos 90 minutos: a partida segue para prorrogação e pênaltis no mesmo jogo para definir o ponto da série.",
        ],
      },
    ],
  },
  {
    heading: "Configuração e diretrizes de jogo",
    rules: [
      { title: "Mínimo de jogadores", items: ["Mínimo obrigatório de 8 jogadores em campo por time durante toda a competição."] },
      {
        title: "Horários e tolerância",
        items: [
          "Tolerância máxima de 10 minutos apenas para o 1º jogo do confronto.",
          "Intervalo máximo entre as partidas da mesma série (MD3/MD7) é de 5 minutos.",
        ],
      },
      {
        title: "W.O.",
        items: ["O não comparecimento no horário estipulado gera vitória por W.O. para o adversário (2x0 na MD3 e 4x0 na MD7)."],
      },
      {
        title: "Uniformes",
        items: ["O time da casa escolhe o kit primeiro. O time visitante deve usar cores contrastantes para evitar confusão."],
      },
    ],
  },
  {
    heading: "Envio de resultados e estatísticas",
    rules: [
      {
        title: "Responsabilidade",
        items: ["O capitão do time vencedor deve postar as comprovações no canal #resultados-e-prints em até 30 minutos após o fim do confronto."],
      },
      {
        title: "Prints obrigatórios",
        items: [
          "Placar final do jogo (com tela de pênaltis, se houver).",
          "Aba de estatísticas individuais (gols, assistências e notas da partida).",
        ],
      },
    ],
  },
  {
    heading: "Regras para quedas de conexão",
    rules: [
      {
        title: "Queda até os 15 minutos",
        items: ["Se um jogador cair até os 15' do 1º tempo sem nenhum gol marcado, o jogo deve ser reiniciado em 0x0."],
      },
      {
        title: "Queda após os 15 minutos",
        items: [
          "A partida segue normalmente.",
          "Se o jogador que caiu for o goleiro manual, deve-se quitar, tirar print do placar/tempo exato e jogar o tempo restante em um novo lobby.",
        ],
      },
    ],
  },
  {
    heading: "Fair play e punições",
    rules: [
      {
        title: "Proibições",
        items: [
          "Estritamente proibido fazer cera com goleiro manual ou usar bugs para travar a animação do cobrador em faltas e escanteios.",
          "O uso comprovado de glitches/bugs do jogo anula o resultado a favor do adversário.",
        ],
      },
      {
        title: "Conduta",
        items: ["Ofensas, discriminação ou desrespeito nos canais do Discord ou voz resultam em perda de pontos ou eliminação sumária do torneio."],
      },
      {
        title: "Protestos",
        items: ["Qualquer reclamação deve ser enviada com prova em vídeo no canal ⚠️ suporte-de-protestos em até 15 minutos após a série acabar."],
      },
    ],
  },
];

const AWARDS = [
  { label: "🥇 1º lugar (campeão)", value: "R$ 700,00" },
  { label: "🥈 2º lugar (vice-campeão)", value: "R$ 150,00" },
  { label: "⚽ Artilheiro do campeonato", value: "R$ 25,00" },
  { label: "🅰️ Líder de assistências", value: "R$ 25,00" },
];

export default function RegulamentoPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 space-y-12">
      <SectionTitle
        eyebrow="Documento oficial"
        title="Regulamento"
        description="Leia com atenção antes de inscrever seu time. Em caso de dúvida, procure a organização nos canais oficiais."
      />

      <Panel className="p-6">
        <p className="font-display text-sm font-semibold uppercase tracking-wider text-gold-400">
          Inscrição e premiação
        </p>
        <p className="mt-2 text-sm text-steel">
          Valor da inscrição: <span className="font-semibold text-ivory">R$ 125,00 por time.</span>
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {AWARDS.map((a) => (
            <div
              key={a.label}
              className="flex items-center justify-between rounded-lg border border-navy-700 bg-navy-800/60 px-4 py-3"
            >
              <span className="text-sm text-steel">{a.label}</span>
              <span className="stat-num font-semibold text-gold-400">{a.value}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-steel-dim">
          Em caso de empate em gols ou assistências, o prêmio é dividido igualmente entre os
          líderes. A contagem oficial é feita exclusivamente com base nos prints enviados no
          canal ⚽ resultados-e-prints ao final de cada partida.
        </p>
      </Panel>

      {SECTIONS.map((section) => (
        <div key={section.heading}>
          <h2 className="font-display mb-4 text-xl font-semibold text-ivory">
            {section.heading}
          </h2>
          <div className="space-y-4">
            {section.rules.map((rule) => (
              <Panel key={rule.title} className="p-5">
                <p className="mb-2 text-sm font-semibold text-gold-400">{rule.title}</p>
                <ul className="space-y-1.5">
                  {rule.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-steel">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-500/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Panel>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
