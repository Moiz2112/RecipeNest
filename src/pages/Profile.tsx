import { GetServerSideProps } from 'next';
import ProfileInformation from '../components/Profile_Information/ProfileInformation';
import { getServerSidePropsUtility } from '../utils/utils';

function Profile(_props?: Record<string, unknown>) {

    return (
        <div className="flex min-h-screen items-start justify-center bg-gradient-to-b from-rose-50 via-white to-amber-50 px-4 py-10 md:py-16">
            <ProfileInformation />
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return await getServerSidePropsUtility(context, 'api/profile', 'profileData');
};

export default Profile;