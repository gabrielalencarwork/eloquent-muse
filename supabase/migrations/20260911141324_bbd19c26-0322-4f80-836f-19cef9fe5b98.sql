REVOKE EXECUTE ON FUNCTION public.increment_book_download_count(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_book_download_count(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_book_download_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_book_download_count(uuid) TO service_role;