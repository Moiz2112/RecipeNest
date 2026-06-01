import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Recipe } from '../types/index';
import { useState } from 'react';

interface RecipeCardProps {
    recipe: Recipe;
    removeMargin?: boolean;
    isModalView?: boolean;
    selectedRecipes?: any[];
}

const RecipeCard = ({ recipe, removeMargin, isModalView = false }: RecipeCardProps) => {
    const [showAllInstructions, setShowAllInstructions] = useState(false);
    const initialInstructionCount = 3;
    const instructionPreview = recipe.instructions.slice(0, initialInstructionCount);
    const visibleInstructions = isModalView && !showAllInstructions ? instructionPreview : recipe.instructions;
    const parentClassName = `w-full max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden relative ${removeMargin ? '' : 'mt-10 mb-5'}`;

    return (
        <div className={`${parentClassName} overflow-x-hidden`} key={recipe.name}>
            <div className="px-6 py-4 relative">

                {/* === Recipe Title and Optional Switch === */}
                <div className="flex justify-between items-stretch w-full">
                    {/* Recipe Name */}
                    <div className="font-bold text-lg sm:text-xl lg:text-2xl mb-4 w-full" title={recipe.name}>
                        {recipe.name}
                    </div>
                </div>


                {/* === Collapsible: Instructions === */}
                <Disclosure defaultOpen={isModalView}>
                    {({ open }) => (
                        <>
                            <DisclosureButton className="flex justify-between w-full px-4 py-2 text-lg font-semibold text-left text-brand-900 bg-brand-100 rounded-lg hover:bg-brand-200 focus:outline-none">
                                <span>Instructions</span>
                                <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                            </DisclosureButton>

                            <DisclosurePanel className="mt-2 px-4 pt-4 pb-2 text-sm leading-relaxed bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                                <ol className="list-decimal ml-5 space-y-2">
                                    {visibleInstructions.map((instruction, idx) => (
                                        <li key={idx}>
                                            {instruction.replace(/^\d+\.\s*/, '')} {/* Remove any manual numbering */}
                                        </li>
                                    ))}
                                </ol>
                                {isModalView && recipe.instructions.length > initialInstructionCount && (
                                    <button
                                        type="button"
                                        className="text-sm font-semibold text-brand-700 hover:text-brand-900"
                                        onClick={() => setShowAllInstructions((prev) => !prev)}
                                    >
                                        {showAllInstructions ? 'Show Less ▲' : 'Show More ▼'}
                                    </button>
                                )}
                            </DisclosurePanel>
                        </>
                    )}
                </Disclosure>

                {/* === Ingredients Section === */}
                <Disclosure as="div" className="mt-4" defaultOpen={!isModalView}>
                    {({ open }) => (
                        <>
                            <DisclosureButton className="flex justify-between w-full px-4 py-2 text-lg font-semibold text-left text-brand-900 bg-brand-100 rounded-lg hover:bg-brand-200 focus:outline-none">
                                <span>{`Ingredients (${recipe.ingredients.length} items)`}</span>
                                <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                            </DisclosureButton>
                            <DisclosurePanel className="mt-2 px-4 pt-4 pb-2 text-sm leading-relaxed bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                                <ul className="list-disc ml-5 space-y-2">
                                    {recipe.ingredients.map((ingredient) => (
                                        <li key={ingredient.name}>
                                            {`${ingredient.name}${ingredient.quantity ? ` (${ingredient.quantity})` : ''}`}
                                        </li>
                                    ))}
                                </ul>
                            </DisclosurePanel>
                        </>
                    )}
                </Disclosure>

                {/* === Dietary Preferences === */}
                <h3 className="mt-4 text-gray-700 font-semibold text-lg">Dietary Preference:</h3>
                <div className="mb-5 mt-2 flex flex-wrap gap-2">
                    {Array.isArray(recipe.dietaryPreference) && recipe.dietaryPreference.length > 0 ? (
                        recipe.dietaryPreference.map((preference) => (
                            <span
                                key={preference}
                                className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded"
                            >
                                {preference}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-500">No dietary preference specified</span>
                    )}
                </div>

                {/* === Collapsible: Additional Information === */}
                <Disclosure as="div" className="mt-4">
                    {({ open }) => (
                        <>
                            <DisclosureButton className="flex justify-between w-full px-4 py-2 text-lg font-semibold text-left text-brand-900 bg-brand-100 rounded-lg hover:bg-brand-200 focus:outline-none">
                                <span>Additional Information</span>
                                <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                            </DisclosureButton>

                            <DisclosurePanel className="mt-2 px-4 pt-4 pb-2 text-sm leading-relaxed bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                                {recipe.additionalInformation ? (
                                    <>
                                        <div><strong>Tips:</strong> {recipe.additionalInformation.tips || 'N/A'}</div>
                                        <div><strong>Variations:</strong> {recipe.additionalInformation.variations || 'N/A'}</div>
                                        <div><strong>Serving Suggestions:</strong> {recipe.additionalInformation.servingSuggestions || 'N/A'}</div>
                                        <div><strong>Nutritional Information:</strong> {recipe.additionalInformation.nutritionalInformation || 'N/A'}</div>
                                    </>
                                ) : (
                                    <div>No additional information available</div>
                                )}
                            </DisclosurePanel>
                        </>
                    )}
                </Disclosure>
            </div>
        </div>
    );
};

export default RecipeCard;
