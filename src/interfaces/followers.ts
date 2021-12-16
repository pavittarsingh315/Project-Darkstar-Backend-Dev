interface FollowerInterface {
   _id: string;
   portrait: string;
   name: string;
   username: string;
   areWhitelisted: boolean;
   isPrivateFollow: boolean;
}

export default FollowerInterface;
