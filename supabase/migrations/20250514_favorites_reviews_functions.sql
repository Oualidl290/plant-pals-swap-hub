
-- Function to get a specific favorite
CREATE OR REPLACE FUNCTION public.get_favorite(p_user_id UUID, p_plant_id UUID)
RETURNS TABLE (id UUID, user_id UUID, plant_id UUID) 
LANGUAGE SQL
SECURITY INVOKER
AS $$
  SELECT id, user_id, plant_id
  FROM public.favorites
  WHERE user_id = p_user_id AND plant_id = p_plant_id;
$$;

-- Function to add a favorite
CREATE OR REPLACE FUNCTION public.add_favorite(p_user_id UUID, p_plant_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  INSERT INTO public.favorites (user_id, plant_id)
  VALUES (p_user_id, p_plant_id)
  ON CONFLICT (user_id, plant_id) DO NOTHING;
END;
$$;

-- Function to remove a favorite
CREATE OR REPLACE FUNCTION public.remove_favorite(p_user_id UUID, p_plant_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  DELETE FROM public.favorites
  WHERE user_id = p_user_id AND plant_id = p_plant_id;
END;
$$;

-- Function to get a user's reviews
CREATE OR REPLACE FUNCTION public.get_user_reviews(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  reviewer_id UUID,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ,
  reviewer_username TEXT,
  reviewer_avatar_url TEXT
)
LANGUAGE SQL
SECURITY INVOKER
AS $$
  SELECT r.id, r.user_id, r.reviewer_id, r.rating, r.comment, r.created_at,
         p.username as reviewer_username, p.avatar_url as reviewer_avatar_url
  FROM public.reviews r
  JOIN public.profiles p ON r.reviewer_id = p.id
  WHERE r.user_id = p_user_id
  ORDER BY r.created_at DESC;
$$;

-- Function to create a review
CREATE OR REPLACE FUNCTION public.create_review(
  p_user_id UUID,
  p_reviewer_id UUID,
  p_rating INTEGER,
  p_comment TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_review_id UUID;
BEGIN
  INSERT INTO public.reviews (user_id, reviewer_id, rating, comment)
  VALUES (p_user_id, p_reviewer_id, p_rating, p_comment)
  RETURNING id INTO v_review_id;
  
  RETURN v_review_id;
END;
$$;
