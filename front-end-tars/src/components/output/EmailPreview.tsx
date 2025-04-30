// src/components/output/EmailPreview.tsx
import React, { ChangeEvent } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { Send, Loader2, CheckCircle, Mail } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  updateEditedEmail,
  setSendingEmails,
  setEmailsSent,
} from "../../store/slices/outputSlice";

const EmailPreview: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    summaryCardData,
    selectedDepartmentId,
    editedEmails,
    sendingEmails,
    emailsSent,
  } = useAppSelector((state) => state.output);

  if (!summaryCardData || !selectedDepartmentId || !editedEmails) {
    return (
      <Card className="flex items-center justify-center h-full p-6 text-text-secondary rounded-md">
        <p>Select a department to view email</p>
      </Card>
    );
  }

  const selectedDepartment = summaryCardData.departments.find(
    (d) => d.id === selectedDepartmentId
  );

  if (!selectedDepartment) {
    return (
      <Card className="flex items-center justify-center h-full p-6 text-text-secondary rounded-md">
        <p>Department not found</p>
      </Card>
    );
  }

  const currentEmail = editedEmails[selectedDepartmentId];

  const handleInputChange = (
    field: "to" | "subject" | "body",
    value: string
  ) => {
    dispatch(
      updateEditedEmail({
        departmentId: selectedDepartmentId,
        field,
        value,
      })
    );
  };

  const handleSendEmails = async () => {
    dispatch(setSendingEmails(true));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    dispatch(setSendingEmails(false));
    dispatch(setEmailsSent(true));
  };

  return (
    <Card className="flex flex-col h-full rounded-md overflow-hidden">
      <div className="p-4 bg-dark-elevated border-b border-dark-border flex items-center">
        <Mail className="h-5 w-5 mr-2 text-accent-orange" />
        <h3 className="font-semibold text-text-primary">
          Email to {selectedDepartment.department} Manager
        </h3>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div>
          <Label htmlFor="recipient">To</Label>
          <Input
            id="recipient"
            value={currentEmail.to}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleInputChange("to", e.target.value)
            }
            className="mt-1 bg-dark-surface border-dark-border rounded-md"
            disabled={sendingEmails || emailsSent}
          />
          <p className="text-xs text-text-secondary mt-1">
            Recipient: {currentEmail.recipient}
          </p>
        </div>

        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={currentEmail.subject}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleInputChange("subject", e.target.value)
            }
            className="mt-1 bg-dark-surface border-dark-border rounded-md"
            disabled={sendingEmails || emailsSent}
          />
        </div>

        <div className="flex-1">
          <Label htmlFor="body">Email Body</Label>
          <Textarea
            id="body"
            value={currentEmail.body}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              handleInputChange("body", e.target.value)
            }
            className="mt-1 min-h-[200px] font-mono text-sm bg-dark-surface border-dark-border rounded-md"
            disabled={sendingEmails || emailsSent}
          />
        </div>
      </div>

      <Separator className="bg-dark-border" />

      <div className="p-4 bg-dark-elevated">
        {emailsSent ? (
          <div className="flex items-center justify-center text-accent-green bg-accent-green bg-opacity-10 p-2 rounded-md border border-accent-green border-opacity-20">
            <CheckCircle className="h-5 w-5 mr-2" />
            All emails sent successfully!
          </div>
        ) : (
          <Button
            onClick={handleSendEmails}
            disabled={sendingEmails}
            className="w-full justify-center bg-accent-orange hover:bg-accent-orange/90 text-white rounded-md"
          >
            {sendingEmails ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Sending all emails...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Confirm and Send All Emails
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default EmailPreview;
