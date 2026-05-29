// backend/functions/src/routes/lifecycle.ts
import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { verifyAdminRole } from '../middleware/auth';

const router = Router();
const db = admin.firestore();

// System Archival Route
router.put('/archive/:id', verifyAdminRole, async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    await db.collection('students').doc(id).update({
      status: 'Archived',
      archivedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return res.status(200).json({ message: `Node ${id} safely shifted to compliance Archival state.` });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update structural Firestore entity.' });
  }
});

// Permanent Purge Authority Gate
router.delete('/purge/:id', verifyAdminRole, async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    // Only allow ROOT_ADMIN role access to completely destroy data documents
    if (req.user.role !== 'ROOT_ADMIN') {
      return res.status(403).json({ error: 'Purge Authority requires Root Node confirmation.' });
    }
    
    await db.collection('students').doc(id).delete();
    return res.status(200).json({ message: `Node ${id} permanently deleted from infrastructure ecosystem.` });
  } catch (error) {
    return res.status(500).json({ error: 'Failed database execution sequence.' });
  }
});

export default router;