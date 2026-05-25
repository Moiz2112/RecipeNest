import { useState, useEffect } from "react";
import Image from 'next/image';
import useWindowSize from "./Hooks/useWindowSize";
import tagLoad from '../assets/tagload.gif';

interface Tag {
    _id: string;
    count: number;
}

interface PopularTagsProps {
    tags: Tag[];
    onTagToggle: (activeTag: string) => void;
    searchVal: string;
}

// Default popular tags to show if none are available yet
const DEFAULT_TAGS = [
    { _id: "vegetarian", count: 255 },
    { _id: "gluten-free", count: 179 },
    { _id: "savory", count: 130 },
    { _id: "spicy", count: 122 },
    { _id: "healthy", count: 120 },
    { _id: "protein", count: 95 },
    { _id: "vegan", count: 92 },
    { _id: "quick", count: 89 },
    { _id: "garlic", count: 85 },
    { _id: "breakfast", count: 85 },
    { _id: "easy", count: 84 },
    { _id: "chicken", count: 75 },
    { _id: "dinner", count: 72 },
    { _id: "tomato", count: 70 },
    { _id: "dessert", count: 63 },
    { _id: "almond", count: 63 },
    { _id: "indian", count: 58 },
    { _id: "rice", count: 51 },
    { _id: "creamy", count: 50 },
    { _id: "sweet", count: 50 }
];

const PopularTags = ({ tags, onTagToggle, searchVal }: PopularTagsProps) => {
    const [activeTag, setActiveTag] = useState<string>('');

    const { width } = useWindowSize();

    useEffect(() => {
        if (!searchVal.trim()) {
            setActiveTag('');
        }
    }, [searchVal]);

    const handleTagClick = (tag: string) => {
        const newActiveTag = activeTag === tag ? '' : tag;
        setActiveTag(newActiveTag);
        onTagToggle(newActiveTag);
    };

    // Use provided tags or default tags if none available
    const displayTags = tags.length > 0 ? tags : DEFAULT_TAGS;

    // Adjust tag display count based on screen size
    const sliceAmount = width < 640 ? 8 : width < 1024 ? 12 : 20;

    return (
        <div className='w-full py-6 px-4'>
            <h2 className='text-xl font-bold mb-4 flex items-center'>🔥 <span className='ml-2'>Popular Tags</span></h2>
            <div className='flex flex-wrap gap-3'>
                {displayTags.length === 0 ? (
                        <Image
                            src={tagLoad}
                            alt="tag-load-gif"
                            width={40}
                            height={40}
                        />
                ) : (
                    displayTags.slice(0, sliceAmount).map(({ _id, count }) => (
                        <button
                            key={_id}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition duration-200 shadow-sm hover:shadow-md border ${activeTag === _id
                                ? 'bg-brand-600 text-white border-brand-600'
                                : 'bg-brand-50 text-brand-800 border-brand-100/70 hover:bg-brand-100/80 hover:text-brand-900'
                                }`}
                            onClick={() => handleTagClick(_id)}
                        >
                            {_id} ({count})
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default PopularTags;
