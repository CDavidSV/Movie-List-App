import InputField from "@/components/inputField-component/inputField";
import { ToastContext } from "@/contexts/ToastContext";
import { GlobalContext } from "@/contexts/GlobalContext";
import { useContext, useEffect, useRef, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import defaultPfp from '../../assets/images/profile-default.png';
import { getRelativeTime } from "@/lib/utils";
import { Link, useSearchParams } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

function UserCard({ username, profilePictureUrl, joinedAt }: UserSearchResult) {
    return (
        <Link to={`/user/${username}`} className="flex flex-row items-center justify-start gap-6 rounded-lg border p-4 mb-3">
            <Avatar className="h-20 w-20">
                <AvatarImage src={profilePictureUrl || defaultPfp}></AvatarImage>
            </Avatar>
            <h3>{username}</h3>
            {joinedAt &&
                <div className="text-center ml-auto">
                    <p className="font-semibold m-0">Joined</p>
                    <p className="m-0 text-muted-foreground">{getRelativeTime(joinedAt)}</p>
                </div>
            }
        </Link>
    );
}

export default function SearchUsers() {
    document.title = "Search Users | My Movie List";
    const toast = useContext(ToastContext);
    const { mml_api_protected } = useContext(GlobalContext);
    let [searchParams, setSearchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<UserSearchResult[]>([]);
    const timeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (searchParams.has("username")) {
            searchForUser(searchParams.get("username")!);
        }
    }, [searchParams]);

    const searchForUser = (value: string) => {
        if (value.length < 1) {
            setSearchParams({ username: "" });
            return;
        };
        setSearchParams({ username: value }, { replace: true })

        if (timeout.current) {
            clearTimeout(timeout.current);
        }

        timeout.current = setTimeout(() => {
            timeout.current = null;
            setLoading(true);
            mml_api_protected.get(`/api/v1/user/search?username=${value}`).then((response) => {
                if (response.data.responseData.length > 0) {
                    setSearchParams({ username: value })
                }

                setUsers(response.data.responseData.map((u: any) => (
                    {
                        id: u.id,
                        username: u.username,
                        profilePictureUrl: u.profile_picture_url,
                        joinedAt: u.joined_at && new Date(u.joined_at)
                    }
                )));
            }).catch(() => {
                toast.open("An error occurred while searching for the user. Please try again later.", "error");
            }).finally(() => {
                setLoading(false);
            });
        }, 200);
    }

    return (
        <div className="content">
            <div className="content-wrapper">
                <h1>Search for other users</h1>
                <p className="text-muted-foreground m-0 h">
                    You can search for other users by their username.
                </p>
                <div className="flex flex-row items-center">
                    <InputField defaultValue={searchParams.get("username") || ""} className="w-full md:w-64" type="text" id="user-search" required={false} label="Username" clearButton={true} onInputChange={searchForUser} />
                    {loading && <LoaderCircle className="ml-3 animate-spin text-muted-foreground" size={30} />}
                </div>
                {
                    users.length > 0 && users.map((u) => (
                        <UserCard {...u} />
                    ))
                }
            </div>
        </div>
    );
}
