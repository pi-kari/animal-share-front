import { cn } from "@/lib/utils";
import { Tag, TagCategory } from "@/types";

interface TagChipProps {
  tag: Tag;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

const getCategoryStyles = (category: TagCategory, isSelected: boolean, isClickable: boolean) => {
  const baseStyles = "rounded-full font-medium transition-colors border";
  
  if (isSelected) {
    switch (category) {
      case '分類':
        return `${baseStyles} bg-secondary text-white border-secondary`;
      case '角度':
        return `${baseStyles} bg-accent-blue text-white border-accent-blue`;
      case 'パーツ':
        return `${baseStyles} bg-accent-green text-white border-accent-green`;
      case '自由':
        return `${baseStyles} bg-accent-yellow text-white border-accent-yellow`;
    }
  }
  
  if (isClickable) {
    switch (category) {
      case '分類':
        return `${baseStyles} bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary hover:text-white`;
      case '角度':
        return `${baseStyles} bg-accent-blue/10 text-accent-blue border-accent-blue/20 hover:bg-accent-blue hover:text-white`;
      case 'パーツ':
        return `${baseStyles} bg-accent-green/10 text-accent-green border-accent-green/20 hover:bg-accent-green hover:text-white`;
      case '自由':
        return `${baseStyles} bg-accent-yellow/10 text-yellow-600 border-yellow-200 hover:bg-accent-yellow hover:text-white`;
    }
  }
  
  // Non-clickable selected state
  switch (category) {
    case '分類':
      return `${baseStyles} bg-secondary/10 text-secondary border-secondary/20`;
    case '角度':
      return `${baseStyles} bg-accent-blue/10 text-accent-blue border-accent-blue/20`;
    case 'パーツ':
      return `${baseStyles} bg-accent-green/10 text-accent-green border-accent-green/20`;
    case '自由':
      return `${baseStyles} bg-accent-yellow/10 text-yellow-600 border-yellow-200`;
  }
};

const getSizeStyles = (size: 'sm' | 'md') => {
  return size === 'sm' ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm';
};

export function TagChip({ tag, isSelected = false, onClick, size = 'md' }: TagChipProps) {
  const isClickable = !!onClick;
  const categoryStyles = getCategoryStyles(tag.category, isSelected, isClickable);
  const sizeStyles = getSizeStyles(size);
  
  const Component = isClickable ? 'button' : 'span';
  
  return (
    <Component
      className={cn(categoryStyles, sizeStyles, isClickable && "flex-shrink-0")}
      onClick={onClick}
      type={isClickable ? "button" : undefined}
    >
      {tag.name}
    </Component>
  );
}
