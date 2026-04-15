-- Schedule evaluate-rules to run every minute
SELECT cron.schedule(
  'evaluate-payment-rules',
  '* * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://vixpxmvsndusngxdmjuv.supabase.co/functions/v1/evaluate-rules',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHB4bXZzbmR1c25neGRtanV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2ODI4NjYsImV4cCI6MjA1NDI1ODg2Nn0.P4isRrXOmEkgcSAoI4iQFxKm0eX6Bk0Lk7hBlTyXsyI'
      ),
      body:=jsonb_build_object('time', now()::text)
    ) AS request_id;
  $$
);