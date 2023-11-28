import React from 'react';
import {Link} from 'react-router-dom';

/**
 * The home page
 * @returns 
 */
const Home = ()=>{
    return (
        <div className="w-full h-screen bg-gradient-to-r from-baby-blue/10 
        to-azure/10 grid content-center justify-items-center">

            <h1 className="w-4/5 m-3 font-bold text-6xl text-center">
                Survey Creator
            </h1>

            <p className="w-4/5 m-2 font-bold text-2xl text-center">
                Create surveys and take them
            </p>

            <div className='inline-flex flex-col sm:flex-row items-center'>
                <Link 
                    className="bg-baby-blue px-10 pt-3 pb-4 rounded-2xl m-5
                        hover:bg-azure transition-all font-bold text-xl text-white 
                        shadow-lg shadow-baby-blue/50 hover:shadow-azure/40" 
                    to="/surveys">
                    Browse surveys
                </Link>

                <Link 
                    className="bg-baby-blue px-10 pt-3 pb-4 rounded-2xl m-5
                        hover:bg-azure transition-all font-bold text-xl text-white 
                        shadow-lg shadow-baby-blue/50 hover:shadow-azure/40"
                    to="/newsurvey">
                    Create a survey
                </Link>
            </div>

            <p className="w-4/5 m-2 font-medium text-lg justify-left">
                For Akin Mulakat Soru
            </p>

            <p className="w-4/5 m-2 font-medium text-lg justify-left">
                Made by: Osama Hamada
            </p>
        </div>
    );
}

export default Home;