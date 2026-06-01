import Profile, { getServerSideProps } from "../../src/pages/Profile";
import { render } from '@testing-library/react'

/* ProfileInformation sub-component needs to use useSession */
jest.mock("next-auth/react", () => ({
    ...jest.requireActual('next-auth/react'),
    useSession: jest.fn(() => ({
        data: {
            user: {
                name: "mockuser",
                image: "https://www.mockimage",
                email: "mockEmail"
            },
        },
        status: 'authenticated'
    }))
}))

jest.mock("../../src/utils/utils", () => ({
    ...jest.requireActual("../../src/utils/utils"),
    getServerSidePropsUtility: jest.fn(() => Promise.resolve('mock_serverside_props_return'))
}))

const routePushMock = jest.fn()

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock,
        events:{
            on: jest.fn(),
            off: jest.fn()
        }
    })),
}))

describe('The Profile component', () => {
    it('shall render the profile editor', () => {
        const { container } = render(<Profile />)
        expect(container).toMatchSnapshot()
    })
})


describe('updating the serverside props', () => {
    it('shall update', async () => {
        const response = await getServerSideProps('' as any);
        expect(response).toBe('mock_serverside_props_return')
    })
})