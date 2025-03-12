import React from 'react';
import BlogList from './BlogList';

const Blog = () => {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
        <p className="text-lg text-gray-600">
          Latest articles, tips, and resources for test preparation
        </p>
      </div>
      <BlogList />
    </div>
  );
};

export default Blog;
