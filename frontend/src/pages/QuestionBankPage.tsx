import { useState } from 'react';
import { Search } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { AnimatedList } from '../components/ui/AnimatedList';
import { QuestionCard } from '../components/questions/QuestionCard';
import { FilterPanel } from '../components/questions/FilterPanel';
import { useQuestions } from '../hooks/useQuestions';

export function QuestionBankPage() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuestions({
    page,
    per_page: 20,
    q: search || undefined,
    difficulty: difficulty || undefined,
    is_duplicate: showDuplicates ? true : undefined,
  });

  return (
    <PageWrapper>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none"
          />
        </div>

        <div className="flex gap-6">
          <div className="w-56 shrink-0">
            <FilterPanel
              difficulty={difficulty}
              onDifficultyChange={(v) => { setDifficulty(v); setPage(1); }}
              showDuplicatesOnly={showDuplicates}
              onDuplicatesChange={(v) => { setShowDuplicates(v); setPage(1); }}
            />
          </div>

          <div className="flex-1 space-y-4">
            {isLoading ? (
              <p className="text-gray-400">Loading questions...</p>
            ) : data?.questions.length ? (
              <>
                <p className="text-sm text-gray-400">{data.total} questions found</p>
                <AnimatedList>
                  {data.questions.map((q) => (
                    <QuestionCard key={q.id} question={q} />
                  ))}
                </AnimatedList>
                <div className="flex justify-center gap-2 pt-4">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-500">Page {page}</span>
                  <button
                    disabled={!data || page * 20 >= data.total}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-center py-12">No questions found</p>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
