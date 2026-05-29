import { useEffect, useState, useRef, useCallback } from 'react';
import { ClockIcon, FireIcon } from '@heroicons/react/24/solid';
import SearchBar from '../components/SearchBar';
import ViewRecipes from '../components/Recipe_Display/ViewRecipes';
import FloatingActionButtons from '../components/FloatingActionButtons';
import Loading from '../components/Loading';
import PopularTags from '../components/PopularTags';
import InventoryHero from '../components/InventoryHero';
import { usePagination } from '../components/Hooks/usePagination';

const Home = () => {
    const [searchVal, setSearchVal] = useState('');
    const [sortOption, setSortOption] = useState<'recent' | 'popular'>('popular');
    const [searchTrigger, setSearchTrigger] = useState<true | false>(false);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const lastRecipeRef = useRef<HTMLDivElement | null>(null);

    const isSearching = searchVal.trim() !== "";
    const endpoint = isSearching ? "/api/search-recipes" : "/api/get-recipes";

    const {
        data: latestRecipes,
        loading,
        popularTags,
        loadMore,
        handleRecipeListUpdate,
        totalRecipes,
        page,
        totalPages
    } = usePagination({
        endpoint,
        sortOption,
        searchQuery: searchVal.trim(),
        searchTrigger,
        resetSearchTrigger: () => setSearchTrigger(false),
    });
    useEffect(() => {
        if (!latestRecipes.length) return;

        const lastRecipeElement = lastRecipeRef.current;
        if (!lastRecipeElement) return;

        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting && !loading && page < totalPages) {
                loadMore();
                if (searchVal.trim() && !searchTrigger) {
                    setSearchTrigger(true);
                }
            }
        }, { threshold: 0.5 });

        observerRef.current.observe(lastRecipeElement);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null; // Ensure observerRef is fully reset
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latestRecipes, loading]);

    const handleSearch = useCallback(() => {
        if (!searchVal.trim()) return;

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
            searchTimeout.current = null; // Explicitly reset the timeout reference
        }

        searchTimeout.current = setTimeout(() => {
            setSearchTrigger(true);
        }, 500);
    }, [searchVal]);

    const sortRecipes = (option: 'recent' | 'popular') => {
        if (sortOption === option || isSearching) return;
        setSortOption(option);
        setSearchTrigger(true);
    };

    const handleTagSearch = async (tag: string) => {
        if (searchVal === tag) {
            setSearchVal(""); // Reset search if clicking the same tag
            return;
        }

        setSearchVal(tag);
        setSearchTrigger(true);
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-brand-50 to-white">
            {/* Header Section */}
            <div className="w-full px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <SearchBar searchVal={searchVal} setSearchVal={setSearchVal} handleSearch={handleSearch} totalRecipes={totalRecipes} />
                    <PopularTags tags={popularTags} onTagToggle={handleTagSearch} searchVal={searchVal} />

                    {/* Sorting Buttons */}
                    <div className="flex gap-4 mt-6 mb-8">
                        <button
                            onClick={() => sortRecipes('recent')}
                            className={`flex items-center px-6 py-2 rounded-lg font-medium transition duration-300 shadow-sm hover:shadow-md ${sortOption === 'recent' ? 'bg-brand-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                            disabled={Boolean(searchVal.trim())}
                        >
                            <ClockIcon className="h-5 w-5 mr-2" />
                            Most Recent
                        </button>
                        <button
                            onClick={() => sortRecipes('popular')}
                            className={`flex items-center px-6 py-2 rounded-lg font-medium transition duration-300 shadow-sm hover:shadow-md ${sortOption === 'popular' ? 'bg-brand-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                            disabled={Boolean(searchVal.trim())}
                        >
                            <FireIcon className="h-5 w-5 mr-2" />
                            Most Popular
                        </button>
                    </div>
                </div>
            </div>

            {/* Inventory Hero Section */}
            <InventoryHero />

            {/* Recipes Section */}
            <div className="w-full px-4 py-8 flex-1">
                <div className="max-w-6xl mx-auto">
                    <ViewRecipes
                        recipes={latestRecipes}
                        handleRecipeListUpdate={handleRecipeListUpdate}
                        lastRecipeRef={lastRecipeRef}
                    />
                    {latestRecipes.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className="text-gray-500 text-lg">No recipes found. Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Actions & Loading */}
            <FloatingActionButtons />
            {loading && <Loading />}
        </div>
    );
};

export default Home;
