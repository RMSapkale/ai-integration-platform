"""
Notification Templates
Pre-built templates for common notification scenarios
"""

from typing import Dict, Any, Optional
from enum import Enum


class NotificationTemplate(str, Enum):
    """Common notification templates"""
    FLOW_SUCCESS = "flow_success"
    FLOW_ERROR = "flow_error"
    SYNC_COMPLETE = "sync_complete"
    SYNC_FAILED = "sync_failed"
    RETRY_EXHAUSTED = "retry_exhausted"
    DATA_VALIDATION_ERROR = "data_validation_error"
    CUSTOM = "custom"


class NotificationTemplates:
    """Pre-built notification templates"""
    
    @staticmethod
    def get_email_template(template: NotificationTemplate, context: Dict[str, Any]) -> Dict[str, str]:
        """
        Get email template with context variables replaced
        
        Args:
            template: Template type
            context: Variables to replace in template
            
        Returns:
            Dict with 'subject' and 'body'
        """
        templates = {
            NotificationTemplate.FLOW_SUCCESS: {
                "subject": "✅ Flow Execution Successful - {flow_name}",
                "body": """
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">✅ Flow Execution Successful</h2>
        </div>
        <div style="background-color: white; padding: 20px; border-radius: 0 0 8px 8px;">
            <p><strong>Flow Name:</strong> {flow_name}</p>
            <p><strong>Execution ID:</strong> {execution_id}</p>
            <p><strong>Completed At:</strong> {timestamp}</p>
            <p><strong>Records Processed:</strong> {records_processed}</p>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #10b981;">
                <p style="margin: 0;"><strong>Summary:</strong> {summary}</p>
            </div>
            
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
                This is an automated notification from Iwings Integration Platform.
            </p>
        </div>
    </div>
</body>
</html>
                """
            },
            
            NotificationTemplate.FLOW_ERROR: {
                "subject": "❌ Flow Execution Failed - {flow_name}",
                "body": """
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">❌ Flow Execution Failed</h2>
        </div>
        <div style="background-color: white; padding: 20px; border-radius: 0 0 8px 8px;">
            <p><strong>Flow Name:</strong> {flow_name}</p>
            <p><strong>Execution ID:</strong> {execution_id}</p>
            <p><strong>Failed At:</strong> {timestamp}</p>
            <p><strong>Step:</strong> {failed_step}</p>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444;">
                <p style="margin: 0;"><strong>Error:</strong></p>
                <pre style="margin: 10px 0 0 0; white-space: pre-wrap;">{error_message}</pre>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #fffbeb; border-left: 4px solid #f59e0b;">
                <p style="margin: 0;"><strong>Action Required:</strong></p>
                <p style="margin: 10px 0 0 0;">{action_required}</p>
            </div>
            
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
                This is an automated notification from Iwings Integration Platform.
            </p>
        </div>
    </div>
</body>
</html>
                """
            },
            
            NotificationTemplate.SYNC_COMPLETE: {
                "subject": "✅ Data Sync Complete - {source} → {destination}",
                "body": """
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">✅ Data Synchronization Complete</h2>
        </div>
        <div style="background-color: white; padding: 20px; border-radius: 0 0 8px 8px;">
            <p><strong>Source:</strong> {source}</p>
            <p><strong>Destination:</strong> {destination}</p>
            <p><strong>Completed At:</strong> {timestamp}</p>
            
            <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                <tr style="background-color: #f3f4f6;">
                    <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Metric</th>
                    <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Count</th>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">Records Processed</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">{records_processed}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">Successful</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb; color: #10b981;">{successful}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">Failed</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb; color: #ef4444;">{failed}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">Duration</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">{duration}</td>
                </tr>
            </table>
            
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
                This is an automated notification from Iwings Integration Platform.
            </p>
        </div>
    </div>
</body>
</html>
                """
            },
            
            NotificationTemplate.RETRY_EXHAUSTED: {
                "subject": "⚠️ Retry Attempts Exhausted - {flow_name}",
                "body": """
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">⚠️ Maximum Retry Attempts Exhausted</h2>
        </div>
        <div style="background-color: white; padding: 20px; border-radius: 0 0 8px 8px;">
            <p><strong>Flow Name:</strong> {flow_name}</p>
            <p><strong>Step:</strong> {step_name}</p>
            <p><strong>Retry Attempts:</strong> {retry_attempts}</p>
            <p><strong>Last Attempt:</strong> {timestamp}</p>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444;">
                <p style="margin: 0;"><strong>Final Error:</strong></p>
                <pre style="margin: 10px 0 0 0; white-space: pre-wrap;">{error_message}</pre>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-left: 4px solid #3b82f6;">
                <p style="margin: 0;"><strong>Recommended Actions:</strong></p>
                <ul style="margin: 10px 0 0 0;">
                    <li>Check system connectivity</li>
                    <li>Verify credentials and permissions</li>
                    <li>Review error logs for details</li>
                    <li>Contact support if issue persists</li>
                </ul>
            </div>
            
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
                This is an automated notification from Iwings Integration Platform.
            </p>
        </div>
    </div>
</body>
</html>
                """
            }
        }
        
        template_data = templates.get(template, templates[NotificationTemplate.CUSTOM])
        
        # Replace placeholders with context values
        subject = template_data["subject"].format(**context)
        body = template_data["body"].format(**context)
        
        return {"subject": subject, "body": body}
    
    @staticmethod
    def get_slack_template(template: NotificationTemplate, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get Slack message template
        
        Returns:
            Slack message payload
        """
        templates = {
            NotificationTemplate.FLOW_SUCCESS: {
                "text": "✅ Flow Execution Successful",
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": "✅ Flow Execution Successful"
                        }
                    },
                    {
                        "type": "section",
                        "fields": [
                            {"type": "mrkdwn", "text": f"*Flow:*\n{context.get('flow_name', 'N/A')}"},
                            {"type": "mrkdwn", "text": f"*Records:*\n{context.get('records_processed', 0)}"},
                            {"type": "mrkdwn", "text": f"*Execution ID:*\n{context.get('execution_id', 'N/A')}"},
                            {"type": "mrkdwn", "text": f"*Time:*\n{context.get('timestamp', 'N/A')}"}
                        ]
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": f"Summary: {context.get('summary', 'Flow completed successfully')}"
                            }
                        ]
                    }
                ]
            },
            
            NotificationTemplate.FLOW_ERROR: {
                "text": "❌ Flow Execution Failed",
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": "❌ Flow Execution Failed"
                        }
                    },
                    {
                        "type": "section",
                        "fields": [
                            {"type": "mrkdwn", "text": f"*Flow:*\n{context.get('flow_name', 'N/A')}"},
                            {"type": "mrkdwn", "text": f"*Failed Step:*\n{context.get('failed_step', 'Unknown')}"},
                            {"type": "mrkdwn", "text": f"*Execution ID:*\n{context.get('execution_id', 'N/A')}"},
                            {"type": "mrkdwn", "text": f"*Time:*\n{context.get('timestamp', 'N/A')}"}
                        ]
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"*Error:*\n```{context.get('error_message', 'Unknown error')}```"
                        }
                    }
                ]
            }
        }
        
        return templates.get(template, {"text": context.get("message", "Notification")})
    
    @staticmethod
    def render_template(
        template: NotificationTemplate,
        notification_type: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Render a notification template
        
        Args:
            template: Template type
            notification_type: "email" or "slack"
            context: Template variables
            
        Returns:
            Rendered template
        """
        if notification_type == "email":
            return NotificationTemplates.get_email_template(template, context)
        elif notification_type == "slack":
            return NotificationTemplates.get_slack_template(template, context)
        else:
            return {"message": context.get("message", "Notification")}
