export default function Avatar({userID, username, online}){
const colors = ['bg-red-200', 'bg-green-200', 'bg-purple-200', 
                'bg-blue-200', 'bg-pink-200', 'bg-yellow-200', 
                'bg-pink-600', 'bg-red-400']

const usedIDBase10 = parseInt(userID, 16);
const colorindex = usedIDBase10 % colors.length;
const color = colors[colorindex];
    return (
        <div className={"m-1 w-8 h-8 relative rounded-full  flex items-center "+color}>
            <div className="text-center w-full"> {username[0]} </div> 
            {/* {online &&(
                <div className="absolute w-3 h-3 bg-green-400 rounded-full border border-customGray bottom-0 right-0"></div>

            )} */}

        </div>
    );
}