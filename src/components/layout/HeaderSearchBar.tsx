import Form from 'next/form';
import React from 'react';

const HeaderSearchBar = () => {
    //redirect to search page with query param on submit
    return (
        <Form action='/search'>
            <div className='relative flex items-center'>
                <div className='absolute inset-y-0 left-0 flex items-center pointer-events-none'>
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-muted-foreground' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                    </svg>
                </div>
                <input
                    type='text'
                    name='query'
                    placeholder='Search'
                    className='w-24 sm:w-36 focus:w-44 bg-transparent border-b border-border pl-6 pr-1 py-1.5 text-sm text-foreground placeholder:text-muted-foreground placeholder:tracking-wide focus:border-foreground focus:outline-none transition-all duration-300'
                />
            </div>
        </Form>
    );
};

export default HeaderSearchBar;
