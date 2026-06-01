import React from 'react';
import RecipeCard from '../RecipeCard';
import { Button } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { Recipe } from '../../types/index';

interface SelectRecipesComponentProps {
    generatedRecipes: Recipe[];
    handleRecipeSubmit: (recipes: Recipe[]) => void;
}

const SelectRecipesComponent = ({ generatedRecipes, handleRecipeSubmit }: SelectRecipesComponentProps) => {
    const finalRecipes = generatedRecipes;

    return (
        <div className="flex flex-col">

            {/* Responsive Recipe Cards with Spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedRecipes.map((recipe) => (
                    <div key={recipe.openaiPromptId}>
                        <RecipeCard recipe={recipe} />
                    </div>
                ))}
            </div>
            <div className="mt-8 w-full flex justify-center">
                {finalRecipes.length ? (
                    <Button
                        onClick={() => handleRecipeSubmit(finalRecipes)}
                        className="flex items-center bg-brand-600 text-white px-6 py-3 rounded-full hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition duration-300 ease-in-out"
                        aria-label="Save all generated recipes"
                    >
                        <CheckIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                        {`Save All (${finalRecipes.length}) Recipes`}
                    </Button>
                ) : (
                    <div className="text-center text-red-500 font-medium px-4 py-3 rounded-lg bg-red-100">
                        No generated recipes are available yet. Please go back and create a new batch.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectRecipesComponent;
