import React, { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSave, faSpinner } from "@fortawesome/free-solid-svg-icons";
import axiosClient from "MBLearn/src/axios-client";
import SuccessModal from "./SuccessModal";
import { Switch } from "MBLearn/src/components/ui/switch"

const timeUnits = [
  { label: "Days", value: "days" },
  { label: "Weeks", value: "weeks" },
  { label: "Months", value: "months" },
];
const DeletedCourseSettingsModal = ({ open, close, onDeleteSuccess }) => {
  const [retentionValue, setRetentionValue] = useState(30);
  const [retentionUnit, setRetentionUnit] = useState("days");
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      axiosClient.get("/fetchDeletedCourseSettings")
        .then(({ data }) => {
          console.log("12312", data);
          setRetentionValue(data.RetentionValue ?? 0);
          setRetentionUnit(data.RetentionUnit ?? "days");
          setAutoDeleteEnabled(Boolean(data.AutoDelete));
        })
        .catch(err => {
          console.error("Failed to fetch settings", err);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleSave = () => {
    if (autoDeleteEnabled && (!retentionValue || retentionValue <= 0)) return;

    const payload = {
      RetentionValue: autoDeleteEnabled ? retentionValue : null,
      RetentionUnit: autoDeleteEnabled ? retentionUnit : null,
      AutoDelete: autoDeleteEnabled ? 1 : 0,
    };
    console.log("Saving payload:", payload);
    setSaving(true);
    axiosClient.put("/updateDeletedCourseSettings", payload)
      .then(() => setSuccess(true))
      .catch((err) => console.error("Save failed", err))
      .finally(() => setSaving(false));
  };
    
  return (
    <>
      <Dialog open={open} onClose={() => {}}>
        <DialogBackdrop className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 z-30" />
        <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="relative transform rounded-md bg-white text-left shadow-xl w-[90vw] md:w-[40vw] p-5">
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h1 className="text-xl font-semibold text-primary">Your Deleted Course Settings</h1>
                  <p className="text-sm text-unactive">
                    Set how long your deleted courses should be retained before permanent deletion.
                  </p>
                </div>
                <div
                  onClick={close}
                  className="border-2 border-primary rounded-full w-6 h-6 flex items-center justify-center text-primary hover:bg-primary hover:text-white cursor-pointer"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </div>
              </div>

              {/* Content */}
              {loading ? (
                <div className="py-10 text-center text-unactive">Loading settings...</div>
              ) : (
                <div className="py-6 flex flex-col gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      id="autoDeleteSwitch"
                      checked={autoDeleteEnabled}
                      onCheckedChange={(checked) => setAutoDeleteEnabled(checked)}
                    />
                    <span>Enable Auto Delete</span>
                  </label>

                  <div className="flex flex-col gap-1">
                    <label className="font-header text-sm">
                      Retention Period <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={retentionValue}
                        onChange={(e) => setRetentionValue(parseInt(e.target.value))}
                        min={1}
                        disabled={!autoDeleteEnabled}
                        className={`border rounded-md p-2 w-full font-text focus:outline-primary ${
                          !autoDeleteEnabled ? "bg-gray-100 cursor-not-allowed" : "border-divider"
                        }`}
                      />
                      <select
                        value={retentionUnit}
                        onChange={(e) => setRetentionUnit(e.target.value)}
                        disabled={!autoDeleteEnabled}
                        className={`border rounded-md p-2 font-text focus:outline-primary ${
                          !autoDeleteEnabled ? "bg-gray-100 cursor-not-allowed" : "border-divider"
                        }`}
                      >
                        {timeUnits.map((unit) => (
                          <option key={unit.value} value={unit.value}>{unit.label}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500">
                      Your deleted courses will be permanently removed after this period.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="bg-white border border-primary text-primary px-4 py-2 rounded hover:bg-primaryhover hover:text-white"
                  onClick={close}
                >
                  Cancel
                </button>
                <button
                  disabled={saving || loading}
                  onClick={handleSave}
                  className={`flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-primaryhover ${
                    (saving || loading) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {saving ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <SuccessModal
        open={success}
        close={() => {
          setSuccess(false);
          close();
          onDeleteSuccess?.();
        }}
        header="Settings Saved"
        desc="Your deleted course retention period has been updated."
        confirmLabel="Close"
      />
    </>
  );
};


export default DeletedCourseSettingsModal;
