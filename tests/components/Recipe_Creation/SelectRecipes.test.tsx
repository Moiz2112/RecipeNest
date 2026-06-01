import SelectRecipesComponent from "../../../src/components/Recipe_Creation/SelectRecipes";
import { fireEvent, render, screen } from '@testing-library/react'
import { stubRecipeBatch } from "../../stub";

describe('The recipe selection component', () => {
    let props: any;
    beforeEach(() => {
        props = {
            generatedRecipes: stubRecipeBatch,
            handleRecipeSubmit: jest.fn()
        }
    })
    afterEach(() => {
        props.handleRecipeSubmit.mockClear()
    })
    it('shall submit all generated recipes without toggles', () => {
        render(<SelectRecipesComponent {...props} />)
        fireEvent.click(screen.getByRole('button', { name: /save all generated recipes/i }))
        expect(props.handleRecipeSubmit).toHaveBeenCalledWith(stubRecipeBatch)
    })
})