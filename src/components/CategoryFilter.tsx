import { categories } from "../data/icons.generated";
import { CategoryDropdown } from "./CategoryDropdown";

const ALL = "__all__";

type CategoryFilterProps = {
  selected: ReadonlySet<string>;
  onToggle: (category: string) => void;
  onClear: () => void;
};

export function CategoryFilter({ selected, onToggle, onClear }: CategoryFilterProps) {
  const items = [
    { value: ALL, label: "All", selected: selected.size === 0 },
    ...categories.map((category) => ({ value: category, label: category, selected: selected.has(category) })),
  ];

  return <CategoryDropdown items={items} onSelect={(value) => (value === ALL ? onClear() : onToggle(value))} />;
}
