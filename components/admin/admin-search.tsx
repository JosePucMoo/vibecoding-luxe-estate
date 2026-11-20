import { getDictionary } from "@/i18n/get-dictionary";

interface AdminSearchProps {
  action: string;
  q?: string;
  placeholder: string;
  /** Params preserved when searching (e.g. active filter). */
  hidden?: Record<string, string | undefined>;
}

/** GET form: no client JS needed, the query lives in the URL. */
export default async function AdminSearch({
  action,
  q,
  placeholder,
  hidden = {},
}: AdminSearchProps) {
  const dict = await getDictionary();

  return (
    <form action={action} method="get" role="search" className="relative w-full md:w-80">
      {Object.entries(hidden).map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null
      )}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="material-icons text-xl leading-none text-nordic/40">
          search
        </span>
      </div>
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        aria-label={dict.admin.search}
        className="block w-full pl-10 pr-3 py-2.5 rounded-lg bg-white text-sm text-nordic shadow-soft placeholder:text-nordic/30 focus:outline-none focus:ring-2 focus:ring-mosque"
      />
    </form>
  );
}
