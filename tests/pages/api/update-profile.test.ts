/**
 * @jest-environment node
 */
import updateProfile from '../../../src/pages/api/update-profile';
import User from '../../../src/models/user';
import { mockRequestResponse } from '../../apiMocks';
import { getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

jest.mock("../../../src/pages/api/auth/[...nextauth]", () => ({
  authOptions: {
    adapter: {},
    providers: [],
    callbacks: {},
  },
}));

jest.mock("next-auth/next");

jest.mock('../../../src/lib/mongodb', () => ({
  connectDB: () => Promise.resolve()
}))

jest.mock('../../../src/models/user', () => ({
  findByIdAndUpdate: jest.fn(),
}));

describe('Updating the profile', () => {
  let getServerSessionSpy: any

  beforeEach(() => {
    getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('shall update name and image', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))

    User.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        lean: jest.fn().mockResolvedValue({
          _id: getServerSessionStub.user.id,
          name: 'New Name',
          image: 'https://example.com/new.png',
        }),
      }),
    );

    const { req, res } = mockRequestResponse('PUT')
    const updatedReq: any = {
      ...req,
      body: {
        name: 'New Name',
        image: 'https://example.com/new.png',
      },
    }

    await updateProfile(updatedReq, res)

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      getServerSessionStub.user.id,
      {
        $set: {
          name: 'New Name',
          image: 'https://example.com/new.png',
        },
      },
      { new: true }
    )
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toEqual({
      user: {
        id: getServerSessionStub.user.id,
        name: 'New Name',
        image: 'https://example.com/new.png',
      },
    })
  })
})