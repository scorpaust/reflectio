import { render, screen, fireEvent } from "@testing-library/react";
import { PremiumContentPreview } from "../PremiumContentPreview";
import { PostWithAuthor } from "@/types/post.types";

// Mock the PremiumModal component
jest.mock("../PremiumModal", () => ({
  PremiumModal: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) => (isOpen ? <div data-testid="premium-modal">Premium Modal</div> : null),
}));

const mockPost: PostWithAuthor = {
  id: "1",
  author_id: "author1",
  title: "Test Premium Post",
  content:
    "This is a long premium content that should be truncated when shown as a preview. It contains valuable information that requires a premium subscription to access fully.",
  type: "thought",
  status: "published",
  is_premium_content: true,
  sources: ["Source 1", "Source 2", "Source 3"],
  view_count: 10,
  reflection_count: 5,
  quality_score: 85,
  is_moderated: false,
  moderation_reason: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  audio_url: null,
  audio_duration: null,
  audio_waveform: null,
  audio_transcript: null,
  author: {
    id: "author1",
    full_name: "Test Author",
    username: "testauthor",
    avatar_url: null,
    current_level: 2,
  },
};

const mockPostWithAudio: PostWithAuthor = {
  ...mockPost,
  audio_url: "https://example.com/audio.mp3",
  audio_duration: 180, // 3 minutes
};

describe("PremiumContentPreview", () => {
  it("renders post title and author information", () => {
    render(<PremiumContentPreview post={mockPost} />);

    expect(screen.getByText("Test Premium Post")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
    expect(screen.getByText("@testauthor")).toBeInTheDocument();
  });

  it("shows premium badge", () => {
    render(<PremiumContentPreview post={mockPost} />);

    expect(screen.getByText("Premium")).toBeInTheDocument();
  });

  it("truncates content based on previewLength", () => {
    render(<PremiumContentPreview post={mockPost} previewLength={50} />);

    const content = screen.getByText(
      /This is a long premium content that should be/
    );
    expect(content.textContent).toContain("...");
  });

  it("shows full content when showFullPreview is true", () => {
    render(<PremiumContentPreview post={mockPost} showFullPreview={true} />);

    expect(screen.getByText(mockPost.content)).toBeInTheDocument();
  });

  it("displays audio preview when post has audio", () => {
    render(<PremiumContentPreview post={mockPostWithAudio} />);

    expect(screen.getByText("Conteúdo em Áudio")).toBeInTheDocument();
    expect(screen.getByText("3:00 minutos")).toBeInTheDocument();
  });

  it("shows sources preview with truncation", () => {
    render(<PremiumContentPreview post={mockPost} />);

    expect(screen.getByText("📚 Fontes & Referências")).toBeInTheDocument();
    expect(screen.getByText("Source 1")).toBeInTheDocument();
    expect(screen.getByText("Source 2")).toBeInTheDocument();
    expect(screen.getByText("+1 mais")).toBeInTheDocument();
  });

  it("opens premium modal when upgrade button is clicked", () => {
    render(<PremiumContentPreview post={mockPost} />);

    const upgradeButton = screen.getByText("Fazer Upgrade");
    fireEvent.click(upgradeButton);

    expect(screen.getByTestId("premium-modal")).toBeInTheDocument();
  });

  it("shows expand/collapse functionality for long content", () => {
    render(<PremiumContentPreview post={mockPost} previewLength={50} />);

    const expandButton = screen.getByText("Ver mais preview");
    expect(expandButton).toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(screen.getByText("Ver menos")).toBeInTheDocument();
  });

  it("displays reflection count as locked", () => {
    render(<PremiumContentPreview post={mockPost} />);

    expect(screen.getByText("5 Reflexões (Premium)")).toBeInTheDocument();
    expect(screen.getByText("Desbloquear")).toBeInTheDocument();
  });

  it("shows preview percentage", () => {
    render(<PremiumContentPreview post={mockPost} previewLength={50} />);

    const previewPercentage = Math.round((50 / mockPost.content.length) * 100);
    expect(
      screen.getByText(`Preview: ${previewPercentage}% do conteúdo`)
    ).toBeInTheDocument();
  });
});
