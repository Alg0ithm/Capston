import {Link} from "react-router-dom";

export default function Header() { 
    return(
        <div className="header">
            <h1>
                <Link to="/">Trip Service</Link>
            </h1>
        </div>
    )
}