interface FollowerInterface {
   _id: string;
   miniPortrait: string;
   name: string;
   username: string;
   areWhitelisted: boolean;
   isPrivateFollow: boolean;
}

export default FollowerInterface;
