// D1 serializes this conditional statement. A join and its capacity check are atomic.
export const ADMIT_SQL=`WITH RECURSIVE slots(n) AS (SELECT 0 UNION ALL SELECT n+1 FROM slots WHERE n<99)
INSERT INTO visitors(id,room,x,z,yaw,action,updated,slot,joined)
SELECT ?1,?2,?3,?4,?5,?6,?7,
COALESCE((SELECT slot FROM visitors WHERE id=?1 AND room=?2),(SELECT n FROM slots WHERE n NOT IN (SELECT slot FROM visitors WHERE room=?2 AND slot IS NOT NULL AND id!=?1) ORDER BY n LIMIT 1)),?7
WHERE (SELECT COUNT(*) FROM visitors WHERE room=?2 AND id!=?1)<100
ON CONFLICT(id) DO UPDATE SET room=excluded.room,x=excluded.x,z=excluded.z,yaw=excluded.yaw,action=excluded.action,updated=excluded.updated,slot=excluded.slot,cushion=CASE WHEN visitors.room=excluded.room THEN visitors.cushion ELSE NULL END,joined=COALESCE(visitors.joined,excluded.joined),speech=CASE WHEN visitors.room=excluded.room THEN visitors.speech ELSE NULL END,speech_until=CASE WHEN visitors.room=excluded.room THEN visitors.speech_until ELSE 0 END`;
export const CUSHION_SQL=`WITH RECURSIVE cushions(n) AS (SELECT 0 UNION ALL SELECT n+1 FROM cushions WHERE n<99)
UPDATE visitors SET cushion=COALESCE(cushion,(SELECT n FROM cushions WHERE n NOT IN (12,15,17,18,32,37) AND n NOT IN (SELECT cushion FROM visitors WHERE room=?2 AND cushion IS NOT NULL) ORDER BY ABS(n/10-8) ASC,ABS(n%10-4) ASC LIMIT 1)) WHERE id=?1 AND room=?2`;
