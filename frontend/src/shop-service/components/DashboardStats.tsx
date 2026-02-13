import { Shop, ShopStatus } from '../models/Shop';
import { User } from '@/auth-service/models/User';

interface DashboardStatsProps {
    shops: Shop[];
    owners: User[];
}

export default function DashboardStats({ shops, owners }: DashboardStatsProps) {
    const totalShops = shops.length;
    const activeShops = shops.filter(s => s.status === ShopStatus.ACTIVE).length;
    const suspendedShops = shops.filter(s => s.status === ShopStatus.SUSPENDED).length;
    const totalOwners = owners.length;

    const stats = [
        { name: 'Total Shops', value: totalShops, color: 'bg-indigo-500' },
        { name: 'Active Shops', value: activeShops, color: 'bg-green-500' },
        { name: 'Suspended Shops', value: suspendedShops, color: 'bg-red-500' },
        { name: 'Total Owners', value: totalOwners, color: 'bg-blue-500' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
                <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                                {/* Simple Icon Placeholder */}
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
