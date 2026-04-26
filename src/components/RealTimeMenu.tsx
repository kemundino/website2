import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import UnifiedMenu from '@/components/UnifiedMenu'
import { ChevronDown } from 'lucide-react'

const RealTimeMenu = () => {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTag, setActiveTag] = useState<'all' | 'regular' | 'custom' | 'special'>('all')
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)

  const categories = ['all', 'Main Course', 'Appetizer', 'Dessert', 'Beverage', 'Pizza', 'Burger', 'Pasta', 'Soup', 'Salad']
  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case 'all': return '🍽️ All'
      case 'Main Course': return '🍽️ Main Course'
      case 'Appetizer': return '🥗 Appetizer'
      case 'Dessert': return '🍰 Dessert'
      case 'Beverage': return '🥤 Beverage'
      case 'Pizza': return '🍕 Pizza'
      case 'Burger': return '🍔 Burger'
      case 'Pasta': return '🍝 Pasta'
      case 'Soup': return '🍲 Soup'
      case 'Salad': return '🥬 Salad'
      default: return cat
    }
  }
  
  return (
    <div className="container py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-12">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3">
          Our Menu
        </h1>
        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover our amazing dishes made just for you
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search for dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Mobile Category Dropdown */}
        <div className="md:hidden">
          <div className="relative">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span>{getCategoryLabel(activeCategory)}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
                <div className="max-h-64 overflow-y-auto">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setCategoryDropdownOpen(false); }}
                      className={`flex w-full items-center rounded-lg px-4 py-3 text-left font-medium transition-colors hover:bg-accent ${
                        activeCategory === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {getCategoryLabel(cat)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Desktop Category Pills */}
        <div className="hidden md:flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0"
            >
              {getCategoryLabel(cat)}
            </Button>
          ))}
        </div>
      </div>

      {/* Tag Filter */}
      <div className="mb-8">
        {/* Mobile Tag Dropdown */}
        <div className="md:hidden">
          <div className="relative">
            <button
              onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span>
                {activeTag === 'all' ? '🍽️ All Items' :
                 activeTag === 'regular' ? '📋 Regular' :
                 activeTag === 'custom' ? '⭐ Custom' :
                 activeTag === 'special' ? '🔥 Special' : '🍽️ All Items'}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${tagDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {tagDropdownOpen && (
              <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
                <div className="max-h-64 overflow-y-auto">
                  {[
                    { value: 'all', label: '🍽️ All Items' },
                    { value: 'regular', label: '📋 Regular' },
                    { value: 'custom', label: '⭐ Custom' },
                    { value: 'special', label: '🔥 Special' }
                  ].map(tag => (
                    <button
                      key={tag.value}
                      onClick={() => { setActiveTag(tag.value as any); setTagDropdownOpen(false); }}
                      className={`flex w-full items-center rounded-lg px-4 py-3 text-left font-medium transition-colors hover:bg-accent ${
                        activeTag === tag.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Desktop Tag Pills */}
        <div className="hidden md:flex gap-2">
          {[
            { value: 'all', label: '🍽️ All Items' },
            { value: 'regular', label: '📋 Regular' },
            { value: 'custom', label: '⭐ Custom' },
            { value: 'special', label: '🔥 Special' }
          ].map(tag => (
            <Button
              key={tag.value}
              variant={activeTag === tag.value ? 'default' : 'outline'}
              onClick={() => setActiveTag(tag.value as any)}
              className={tag.value === 'custom' && activeTag === tag.value ? 'bg-purple-500 hover:bg-purple-600' : ''}
            >
              {tag.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Unified Menu */}
      <UnifiedMenu search={search} category={activeCategory} tag={activeTag} />
    </div>
  )
}

export default RealTimeMenu
