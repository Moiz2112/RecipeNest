import ProfileInformation from "../../../src/components/Profile_Information/ProfileInformation"
import { useSession } from "next-auth/react"
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import * as apiCalls from "../../../src/utils/utils";

jest.mock("next-auth/react")
jest.mock("../../../src/utils/utils")

describe('The profile editor', () => {
    beforeEach(() => {
        (useSession as jest.Mock).mockImplementation(() => ({
            data: {
                user: {
                    name: "mockuser",
                    image: "https://www.mockimage",
                    email: "mockEmail"
                },
            },
            update: jest.fn(),
            status: 'authenticated'
        }));
    });

    it('shall render editable fields', () => {
        const { container } = render(<ProfileInformation />)

        expect(screen.getByText('mockuser')).toBeInTheDocument();
        expect(screen.getByText('mockEmail')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Profile picture URL')).toBeInTheDocument();
        expect(container.querySelector('img')?.src.includes('www.mockimage')).toBeTruthy();
    })

    it('shall save the updated profile', async () => {
        (useSession as jest.Mock).mockImplementationOnce(() => ({
            data: {
                user: {
                    name: "mockuser",
                    image: "https://www.mockimage",
                    email: "mockEmail"
                },
            },
            update: jest.fn(),
            status: 'authenticated'
        }));

        (apiCalls.call_api as jest.Mock).mockResolvedValueOnce({
            user: {
                name: 'new name',
                image: 'https://new-image.test/avatar.png'
            }
        });

        render(<ProfileInformation />)
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'new name' } })
        fireEvent.change(screen.getByLabelText('Profile picture URL'), { target: { value: 'https://new-image.test/avatar.png' } })
        fireEvent.click(screen.getByRole('button', { name: /save profile/i }))

        await waitFor(() => expect(apiCalls.call_api).toHaveBeenCalled())
        expect(await screen.findByText('Profile updated successfully.')).toBeInTheDocument()
    })

    it('shall not render if no session', () => {
        (useSession as jest.Mock).mockImplementationOnce(() => ({
            data: null,
            status: 'loading'
        }));
        const { container } = render(<ProfileInformation />)
        expect(container.firstChild).toBeNull();
    })

    it('shall not render if no user', () => {
        (useSession as jest.Mock).mockImplementationOnce(() => ({
            data: {},
            status: 'loading'
        }));
        const { container } = render(<ProfileInformation />)
        expect(container.firstChild).toBeNull();
    })
})