import React, { useState } from "react";
import { Star, MessageCircle, PenTool, Award, ThumbsUp } from "lucide-react";
import { Review } from "../../types";
import { RatingStars } from "../common/RatingStars";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { toast } from "react-hot-toast";


export const ProductReviews = ({
  initialReviews = [],
}) => {
  const [reviews, setReviews] = useState(initialReviews);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      toast.error("Please enter both your name and review details.");
      return;
    }

    setSubmitting(true);

    const newReview = {
      id: Math.random().toString(36).substr(2, 9),
      user: name.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
    };

    setTimeout(() => {
      setReviews((prev) => [newReview, ...prev]);
      setName("");
      setComment("");
      setRating(5);
      setSubmitting(false);
      toast.success("Review submitted! Thank you for your feedback.");
    }, 800);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-gray-100 dark:border-gray-850 pt-10">
      
      {/* Visual Ratings Aggregator (Left 4 columns) */}
      <div className="lg:col-span-4 space-y-6 bg-gray-50/50 dark:bg-gray-900/30 p-6 rounded-2xl border border-gray-150">
        <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider">
          Reviews Summary
        </h3>
        
        <div className="flex items-baseline gap-2.5">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {averageRating}
          </span>
          <span className="text-xs text-gray-400 font-bold">/ 5.0</span>
        </div>
        
        <div>
          <RatingStars rating={parseFloat(averageRating)} size={18} />
          <p className="text-xs text-gray-500 font-semibold mt-1.5">
            Based on {reviews.length} customer ratings
          </p>
        </div>
      </div>

      {/* Review Lists & Submittor Form (Right 8 columns) */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Write Custom Review Tab */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-4 flex items-center gap-1.5">
            <PenTool size={14} className="text-blue-500" />
            Write A Review
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {/* Star selector */}
              <div className="flex flex-col mb-4">
                <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Rating Value *
                </span>
                <div className="flex items-center gap-1.5 h-10 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 rounded-md text-gray-300 hover:text-yellow-500 transition-colors"
                    >
                      <Star
                        size={20}
                        className={rating >= star ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Detailed Review *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Share your experience using the product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={submitting}>
                Submit Review
              </Button>
            </div>
          </form>
        </div>

        {/* Existing Comments List */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-4 flex items-center gap-1.5">
            <MessageCircle size={14} className="text-blue-500" />
            Comments ({reviews.length})
          </h4>

          {reviews.length === 0 ? (
            <p className="text-xs text-gray-400 italic">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl border border-gray-150 dark:border-gray-800 bg-gray-55/70 dark:bg-gray-950/25 space-y-3 leading-relaxed"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                        {rev.user}
                      </h5>
                      <span className="text-[10px] text-gray-450 font-bold mb-1 block">
                        {rev.date ? new Date(rev.date).toLocaleDateString("en-IN") : "Recent"}
                      </span>
                    </div>
                    <RatingStars rating={rev.rating} size={12} />
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-350 italic">
                    "{rev.comment}"
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-gray-400 hover:text-gray-650 cursor-pointer w-fit select-none">
                    <ThumbsUp size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Helpful (0)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default ProductReviews;
