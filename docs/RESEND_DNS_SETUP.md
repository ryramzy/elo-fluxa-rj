# Resend DNS Setup for eloingles.com.br

## Required DNS Records (add in your DNS provider)
Get these values from: https://resend.com/domains

### SPF Record
Type: TXT  
Name: @  
Value: v=spf1 include:amazonses.com ~all  

### DKIM Record  
Type: TXT  
Name: resend._domainkey  
Value: [get from Resend dashboard]  

### DMARC Record
Type: TXT  
Name: _dmarc  
Value: v=DMARC1; p=none; rua=mailto:contato@eloingles.com.br  

## Verification
After adding records, verify at: https://resend.com/domains  
DNS propagation: up to 48 hours  

## Test
Send a test email to both Gmail and Hotmail/Outlook addresses  
and confirm delivery (not spam) before going live.
