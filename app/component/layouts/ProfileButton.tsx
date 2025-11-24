'use client'

import React, { use } from 'react'
import { useEffect, useState } from 'react'
// import cookie from "cookie";
import Link from 'next/link';

export default function ProfileButton() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // useEffect(() => {
    //     const token = cookies().get('token');
    //     if (token) {
    //         setIsLoggedIn(true);
    //     }
    // }, []);

  return (
    <>
    {/* {isLoggedIn ? ( */}
        <Link href="/profile">
        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-black"></div>
      </Link>
    {/* ) : (<Link href="/login">
        <button className="px-4 py-2 bg-blue-500 rounded text-white">Login</button>
      </Link>)} */}
    </>
  )
}
