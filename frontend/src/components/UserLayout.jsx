import { Outlet } from 'react-router-dom';
import Header from './Header';

const UserLayout = () => {
    return (
        <div className="user-layout">
            <Header />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;
