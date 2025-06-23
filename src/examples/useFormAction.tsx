import { useActionState } from "react";
import { Form, Input, Button, Typography, Alert } from "antd";

interface ContactFormState {
  success: boolean;
  message: string;
}

async function sendContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');
  console.log("Name Email message", name, email, message, prevState);
  // Simulate async API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Thank you for contacting us!"
      });
    }, 1000);
  });
}

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState<ContactFormState, FormData>(
    sendContactForm,
    { success: false, message: "" }
  );

  return (
    <form
      action={formAction}
      style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 8, background: "#fff" }}
    >
      <Typography.Title level={3}>Contact Us</Typography.Title>
      <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter your name' }]}> 
        <Input name="name" placeholder="Your Name" required />
      </Form.Item>
      <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }]}> 
        <Input name="email" type="email" placeholder="Your Email" required />
      </Form.Item>
      <Form.Item label="Message" name="message" rules={[{ required: true, message: 'Please enter your message' }]}> 
        <Input.TextArea name="message" placeholder="Your Message" rows={4} required />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isPending} block>
          {isPending ? "Sending..." : "Send"}
        </Button>
      </Form.Item>
      {state.message && (
        <Alert
          message={state.message}
          type={state.success ? "success" : "error"}
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </form>
  );
}
