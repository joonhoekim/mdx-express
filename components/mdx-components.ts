import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import {
  Callout,
  CodeBlock,
  Mermaid,
  Steps,
  Step,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card as WritingCard,
  Blockquote,
  Badge as WritingBadge,
  Reference,
  ReferenceList,
  Icon,
  MathCodeBridge,
  MugongCard,
} from '@/components/writing-ui';
import { mdxHtmlElements } from './mdx-html-elements';

/** MDX에서 사용 가능한 전체 컴포넌트 레지스트리 */
export const mdxComponents = {
  // Writing UI
  Callout,
  CodeBlock,
  Mermaid,
  Steps,
  Step,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card: WritingCard,
  Blockquote,
  Badge: WritingBadge,
  Reference,
  ReferenceList,
  Icon,
  MathCodeBridge,
  MugongCard,

  // Shadcn UI (접두사로 충돌 방지)
  Button,
  ShadcnCard: Card,
  CardContent,
  CardHeader,
  CardTitle,
  ShadcnBadge: Badge,
  Alert,
  AlertDescription,
  AlertTitle,
  Separator,

  // HTML 요소 스타일링
  ...mdxHtmlElements,
};
