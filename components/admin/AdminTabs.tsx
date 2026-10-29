'use client';

export function AdminTabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg w-fit">
      {items.map((item) => {
        const on = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded-md ${
              on ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
