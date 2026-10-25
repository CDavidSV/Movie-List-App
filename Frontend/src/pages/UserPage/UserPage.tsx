import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { GlobalContext } from "@/contexts/GlobalContext";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigationType, useParams, useSearchParams } from "react-router-dom";
import defaultPfp from '../../assets/images/profile-default.png';
import TabHandler from "@/components/tab-handler/tab-handler";
import { ToastContext } from "@/contexts/ToastContext";
import { LoaderCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

function WatchlistItem({ title, progress, totalProgress, backdrop, poster, status, mediaId, type}: UserWatchlistItemProps) {
    const getStatusColor = (status: string) => {
        switch(status) {
            case "Watching":
                return "border-[#2d8db7] bg-[#2d8db7]";
            case "Finished":
                return "border-[#2ecc71] bg-[#2ecc71]";
            case "Plan to Watch":
                return "border-[#858585] bg-[#858585]";
            default:
                return "border-[#2d8db7] bg-[#2d8db7]";
        }
    }

    return (
        <div className="mb-3">
            <Link className="flex items-center gap-5" to={`/media/${type}/${mediaId}`}>
                <picture>
                    <source media="(max-width: 767px)" srcSet={poster || "/img/No_Poster.jpeg"} />
                    <img className="w-20 max-w-20 rounded-lg md:w-52 md:max-w-52" src={backdrop || "/img/No_Backdrop.jpeg"} alt={title} loading="lazy" />
                </picture>
                <div className="overflow-hidden">
                    <h3 className="text-md lg:text-xl m-0 w-full truncate max-w-[600px]">{title}</h3>
                    <div className="flex lg:hidden ml-auto gap-5 items-center mt-2">
                        <p className="m-0">{progress}/{totalProgress}</p>
                        <p className={cn('m-0 border-2 border-solid rounded-full px-3 bg-opacity-40 text-center', getStatusColor(status))}>{status}</p>
                    </div>
                </div>
                <div className="hidden lg:relative ml-auto lg:flex gap-5 items-center">
                    <p className="m-0">{progress}/{totalProgress}</p>
                    <p className={cn('m-0 border-2 border-solid rounded-full px-3 bg-opacity-40 text-center', getStatusColor(status))}>{status}</p>
                </div>
            </Link>
        </div>
    );
}

function FavoriteItem({ index, mediaId, title, type, poster, backdrop }: UserFavoriteItemProps) {
    return (
        <div className="mb-3">
            <Link className="flex items-center gap-5 justify-start" to={`/media/${type}/${mediaId}`}>
                <h1 className="text-5xl text-center w-[82px] max-w-[82px] flex-shrink-0">{index}</h1>
                <picture className="ml-1">
                    <source media="(max-width: 767px)" srcSet={poster || "/img/No_Poster.jpeg"} />
                    <img className="w-20 max-w-20 rounded-lg md:w-52 md:max-w-52" src={backdrop || "/img/No_Backdrop.jpeg"} alt={title} loading="lazy" />
                </picture>
                <div className="overflow-hidden">
                    <h3 className="text-md lg:text-xl m-0 w-full truncate max-w-[600px]">{title}</h3>
                </div>
            </Link>
        </div>
    );
}

function UserFavorites({ userId, username }: { userId: string, username: string }) {
    const { mml_api_protected, getListCache, setListCache } = useContext(GlobalContext);
    const toast = useContext(ToastContext);
    const cacheKey = `user.favorites.${userId}`;
    const cached = useRef(useNavigationType() === "POP" ? getListCache(cacheKey) : undefined).current;

    const [ loading, setLoading ] = useState(!cached);
    const [ favorites, setFavorites ] = useState<UserFavoriteItemProps[]>(cached ?? []);

    useEffect(() => {
        if (cached) return;

        setLoading(true);
        mml_api_protected.get(`/api/v1/user/${userId}/favorites`).then((response) => {
            const items = response.data.responseData.responseFavorites.map((f: any, index: number) => ({
                mediaId: f.mediaId,
                title: f.title,
                type: f.type,
                dateAdded: f.dateAdded,
                description: f.description,
                poster: f.posterUrl,
                backdrop: f.backdropUrl,
                index: index + 1
            }));
            setListCache(cacheKey, items);
            setFavorites(items);
        }).catch((err)  => {
            console.error(err);
            toast.open("An error occurred while fetching this user's favortes", "error");
        }).finally(() => {
            setLoading(false);
        });
    }, [userId]);

    return (
        <>
            {loading && <div className="flex w-full justify-center h-32">
                <LoaderCircle className="animate-spin text-muted-foreground" size={40} />
            </div>}
            {favorites.length > 0 &&
                <>
                    <h2>{username}'s Top 100</h2>
                    {favorites.map((item, index) => (
                        <div key={item.title + index.toString()}>
                            <FavoriteItem {...item} />
                            <span className="block h-[2px] w-full bg-secondary bg-opacity-50 mb-3"></span>
                        </div>
                    ))}
                </>
            }
        </>
    );
}

function UserWatchlist({ userId }: { userId: string }) {
    const { mml_api_protected, getListCache, setListCache } = useContext(GlobalContext);
    const toast = useContext(ToastContext);
    const cacheKey = `user.watchlist.${userId}`;
    const cached = useRef(useNavigationType() === "POP" ? getListCache(cacheKey) : undefined).current;

    const [ loading, setLoading ] = useState(!cached);
    const [ watchlist, setWatchlist ] = useState<UserWatchlistItemProps[]>(cached ?? []);

    useEffect(() => {
        if (cached) return;

        setLoading(true);
        mml_api_protected.get(`/api/v1/user/${userId}/watchlist`).then((response) => {
            const items = response.data.responseData.responseWatchlist.map((w: any) => ({
                title: w.title,
                progress: w.progress,
                totalProgress: w.totalProgress,
                backdrop: w.backdropUrl,
                poster: w.posterUrl,
                status: w.status,
                mediaId: w.mediaId,
                type: w.type
            }));
            setListCache(cacheKey, items);
            setWatchlist(items);
        }).catch((err)  => {
            console.error(err);
            toast.open("An error occurred while fetching this user's watchlist", "error");
        }).finally(() => {
            setLoading(false);
        });
    }, [userId]);

    return (
        <>
            {loading && <div className="flex w-full justify-center h-32">
                <LoaderCircle className="animate-spin text-muted-foreground" size={40} />
            </div>}
            {watchlist.length > 0 && watchlist.map((item, index) => (
                <div key={item.title + index.toString()}>
                    <WatchlistItem {...item} />
                    <span className="block h-[2px] w-full bg-secondary bg-opacity-50 mb-3"></span>
                </div>
            ))}
        </>
    );
}

export default function UserPage() {
    let { username } = useParams<{ username: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const { mml_api_protected, getListCache, setListCache } = useContext(GlobalContext);
    const toast = useContext(ToastContext);
    const cachedInfo = useRef(useNavigationType() === "POP" ? getListCache(`user.info.${username}`) : undefined).current;

    const [ userInfo, setUserInfo ] = useState<UserPageData | undefined>(cachedInfo);
    const [ tab, setTab ] = useState<string>(searchParams.get("tab") || "");
    const [ loading, setLoading ] = useState(!cachedInfo);

    useEffect(() => {
        document.title = `${username} | My Movie List`;

        if (searchParams.has("tab")) {
            setTab(searchParams.get("tab")!);
        }
    }, [searchParams]) ;

    useEffect(() => {
        if (cachedInfo) return;

        setLoading(true);
        mml_api_protected.get(`/api/v1/user/${username}`).then((response) => {
            const info = {
                id: response.data.responseData.id,
                username: response.data.responseData.username,
                profileBannerUrl: response.data.responseData.profile_banner_url,
                profilePictureUrl: response.data.responseData.profile_picture_url,
                publicWatchlist: response.data.responseData.public_watchlist,
                publicFavorites: response.data.responseData.public_favorites
            };
            setListCache(`user.info.${username}`, info);
            setUserInfo(info);
        })
        .catch((err) => {
            console.error(err);
            toast.open("An error occurred while fetching the user information", "error");
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    const tabs: Tab[] = [
        {
            id: 'watchlist',
            title: 'Watchlist',
            tab: <>
                { userInfo && userInfo.publicWatchlist ? <UserWatchlist userId={userInfo?.id || ""} /> :
                    <div className="flex flex-col items-center justify-center gap-3 h-56 border-[1px] border-dashed border-white">
                        <Lock size={64} />
                        <h4>This user's watchlist is private</h4>
                    </div>
                }
            </>
        },
        {
            id: 'favorites',
            title: 'Favorites',
            tab: <>
            { userInfo && userInfo.publicFavorites ? <UserFavorites username={username || ""} userId={userInfo?.id || ""} /> :
                <div className="flex flex-col items-center justify-center gap-3 h-56 border-[1px] border-dashed border-white">
                    <Lock size={64} />
                    <h4>This user's favorites is private</h4>
                </div>
            }
        </>
        }
    ];

    return (
        <div className="content">
            <div className="h-72 md:h-96 w-full bg-no-repeat bg-cover bg-center bg-secondary" style={{ backgroundImage: `url('${userInfo?.profileBannerUrl}')` }}>
            </div>
            <div className="content-wrapper">
                <div className="flex h-28">
                    <Avatar className="w-36 h-36 top-0 translate-y-[-50%] md:w-52 md:h-52 border-solid border-[5px] border-[var(--background-color)]">
                        <AvatarImage src={userInfo?.profilePictureUrl || defaultPfp} />
                    </Avatar>
                    <h2 className="font-bold mt-4 ml-3">{userInfo?.username}</h2>
                </div>

                {!loading &&
                    <div>
                        <TabHandler defaultTab={tab} tab={tab} tabs={tabs} className="text-center" onTabChange={(tab: Tab) => {
                            setTab(tab.id);
                            setSearchParams({ tab: tab.id }, { replace: true });
                        }} />
                    </div>
                }
            </div>
        </div>
    );
}
