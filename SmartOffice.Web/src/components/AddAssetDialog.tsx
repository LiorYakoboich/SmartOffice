import { useState } from 'react'
import type { FormEvent } from 'react'
import { observer } from 'mobx-react-lite'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { assetStore } from '../stores/AssetStore'

interface AddAssetDialogProps {
  open: boolean
  onClose: () => void
}

const AddAssetDialog = observer(
  ({ open, onClose }: AddAssetDialogProps) => {
    const [name, setName] = useState('')
    const [type, setType] = useState('Desk')
    const [location, setLocation] = useState('')
    const [status, setStatus] = useState('Available')

    const resetForm = () => {
      setName('')
      setType('Desk')
      setLocation('')
      setStatus('Available')
    }

    const handleClose = () => {
      resetForm()
      onClose()
    }

    const handleSubmit = async (event: FormEvent) => {
      event.preventDefault()

      try {
        await assetStore.createAsset({
          name,
          type,
          location,
          status,
        })

        handleClose()
      } catch {
        // Error is already stored in AssetStore.
      }
    }

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Add new asset
        </DialogTitle>

        <DialogContent>
          <Stack
            component="form"
            id="add-asset-form"
            onSubmit={handleSubmit}
            spacing={2.5}
            sx={{ pt: 1 }}
          >
            <TextField
              label="Asset name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              fullWidth
            />

            <TextField
              select
              label="Type"
              value={type}
              onChange={(event) => setType(event.target.value)}
              fullWidth
            >
              <MenuItem value="Desk">Desk</MenuItem>
              <MenuItem value="Room">Room</MenuItem>
              <MenuItem value="Equipment">Equipment</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            <TextField
              label="Location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
              fullWidth
            />

            <TextField
              select
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              fullWidth
            >
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="In Use">In Use</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>

          <Button
            form="add-asset-form"
            type="submit"
            variant="contained"
            disabled={assetStore.loading}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            Add asset
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
)

export default AddAssetDialog