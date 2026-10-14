import { BookOpen, CircleHelp, ListChecks } from 'lucide-react';

const CAP_QUESTIONS = [
  {
    question: 'What is CAP?',
    answer: 'CAP stands for Centralized Admission Process. It is the counselling process used to allot engineering seats based on your eligibility, merit, category, preferences, and the seats available in each round.',
  },
  {
    question: 'How should I use the cutoff shown on this site?',
    answer: 'Select the CAP round and compare your percentile with the cutoff for your exact category, university area, branch, and college before adding an option to your preference form. A cutoff is a reference point, not a guarantee.',
  },
  {
    question: 'What do GOPENH and GOPENO mean?',
    answer: 'GOPENH is the General Open Home University category, while GOPENO is General Open Other than Home University. Always check the category code published for the specific seat type you are eligible for.',
  },
  {
    question: 'Why might a college or branch not appear in my results?',
    answer: 'All courses from the 2026 CAP PDFs are retained, but a course may have no published cutoff for a particular round and category. Change the round, category, course, or region filters to review other available options.',
  },
  {
    question: 'What should I do before submitting my option form?',
    answer: 'Verify your eligibility, documents, category, and the current official CAP information. Keep ambitious, target, and safer preferences in your list, then confirm every choice on the official CET Cell portal.',
  },
  {
    question: 'What does the rating mean?',
    answer: 'The star-like score is derived from the strongest published 2026 cutoff for that college and round. It is a cutoff-strength indicator, not a student review, accreditation, placement, or official CET Cell rating.',
  },
] as const;

export function AboutCap() {
  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
      <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-google-blue-50 text-google-blue-600 flex items-center justify-center border border-google-blue-100 shadow-sm shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              About <span className="text-google-blue-500">CAP</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Practical answers for using 2026 MHT-CET CAP cutoff data and building your preference list.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <CircleHelp className="w-5 h-5 text-google-blue-500 shrink-0" />
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Frequently asked questions</h2>
        </div>

        <div className="space-y-3">
          {CAP_QUESTIONS.map(({ question, answer }) => (
            <article key={question} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <h3 className="font-bold text-slate-900 mb-1">{question}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <aside className="flex items-start gap-3 bg-google-yellow-50 border border-google-yellow-100 rounded-2xl p-4 sm:p-5 text-sm text-slate-700">
        <ListChecks className="w-5 h-5 text-google-yellow-600 shrink-0 mt-0.5" />
        <p>
          This page is a planning aid. Official notices, schedules, eligibility rules, and allotments from the State CET Cell take precedence.
        </p>
      </aside>
    </div>
  );
}
