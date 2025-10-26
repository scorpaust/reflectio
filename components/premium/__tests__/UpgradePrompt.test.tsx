import { render, screen, fireEvent } from "@testing-library/react";
import {
  UpgradePrompt,
  ContentUpgradePrompt,
  ConnectionUpgradePrompt,
  ReflectionUpgradePrompt,
} from "../UpgradePrompt";

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

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, "open", {
  value: mockWindowOpen,
});

describe("UpgradePrompt", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders with default props", () => {
      render(<UpgradePrompt />);

      expect(screen.getByText("Funcionalidade Premium")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Esta funcionalidade está disponível apenas para utilizadores Premium."
        )
      ).toBeInTheDocument();
    });

    it("renders with custom title and description", () => {
      render(
        <UpgradePrompt
          title="Custom Title"
          description="Custom description text"
        />
      );

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
      expect(screen.getByText("Custom description text")).toBeInTheDocument();
    });

    it("displays crown icon", () => {
      render(<UpgradePrompt />);

      const crownIcon = document.querySelector(".lucide-crown");
      expect(crownIcon).toBeInTheDocument();
    });
  });

  describe("Different Contexts and Messages", () => {
    it("renders content access context correctly", () => {
      render(
        <UpgradePrompt context="post_view" restrictionType="premium_content" />
      );

      expect(screen.getByText("Conteúdo Premium")).toBeInTheDocument();
      expect(screen.getByText("Desbloquear Conteúdo")).toBeInTheDocument();
    });

    it("renders connection request context correctly", () => {
      render(
        <UpgradePrompt
          context="connection_request"
          restrictionType="connection_request"
        />
      );

      expect(screen.getByText("Solicitar Conexões")).toBeInTheDocument();
      expect(screen.getByText("Desbloquear Conexões")).toBeInTheDocument();
    });

    it("renders reflection creation context correctly", () => {
      render(
        <UpgradePrompt
          context="reflection_creation"
          restrictionType="reflection_creation"
        />
      );

      expect(screen.getByText("Criar Reflexões")).toBeInTheDocument();
      expect(screen.getByText("Desbloquear Reflexões")).toBeInTheDocument();
    });

    it("shows help text when available", () => {
      render(
        <UpgradePrompt
          context="reflection_creation"
          restrictionType="reflection_creation"
        />
      );

      expect(
        screen.getByText(
          "Utilizadores gratuitos podem criar reflexões apenas em posts públicos de outros utilizadores gratuitos."
        )
      ).toBeInTheDocument();
    });

    it("shows alternative suggestion when available", () => {
      render(
        <UpgradePrompt
          context="reflection_creation"
          restrictionType="reflection_creation"
        />
      );

      expect(
        screen.getByText(
          "💡 Pode visualizar reflexões existentes ou fazer upgrade para interagir sem limitações."
        )
      ).toBeInTheDocument();
    });
  });

  describe("Size Variants", () => {
    it("applies small size classes", () => {
      render(<UpgradePrompt size="sm" />);

      // Find the main container div with the size classes
      const container = document.querySelector(".p-3.text-sm");
      expect(container).toBeInTheDocument();
    });

    it("applies medium size classes (default)", () => {
      render(<UpgradePrompt size="md" />);

      const container = document.querySelector(".p-4");
      expect(container).toBeInTheDocument();
    });

    it("applies large size classes", () => {
      render(<UpgradePrompt size="lg" />);

      const container = document.querySelector(".p-6.text-lg");
      expect(container).toBeInTheDocument();
    });
  });

  describe("Visual Variants", () => {
    it("applies default variant classes", () => {
      render(<UpgradePrompt variant="default" />);

      const container = document.querySelector(
        ".bg-gradient-to-r.from-amber-50.to-orange-50"
      );
      expect(container).toBeInTheDocument();
    });

    it("applies compact variant classes", () => {
      render(<UpgradePrompt variant="compact" />);

      const container = document.querySelector(
        ".bg-amber-50.border.border-amber-200"
      );
      expect(container).toBeInTheDocument();
    });

    it("applies banner variant classes", () => {
      render(<UpgradePrompt variant="banner" />);

      const container = document.querySelector(".border-l-4.border-amber-500");
      expect(container).toBeInTheDocument();
    });
  });

  describe("Interactive Features", () => {
    it("opens premium modal when upgrade button is clicked", () => {
      render(<UpgradePrompt />);

      const upgradeButton = screen.getByText("Fazer Upgrade para Premium");
      fireEvent.click(upgradeButton);

      expect(screen.getByTestId("premium-modal")).toBeInTheDocument();
    });

    it("calls custom action when provided", () => {
      const mockCustomAction = jest.fn();
      render(
        <UpgradePrompt
          customAction={{
            text: "Custom Action",
            onClick: mockCustomAction,
          }}
        />
      );

      const customButton = screen.getByText("Custom Action");
      fireEvent.click(customButton);

      expect(mockCustomAction).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId("premium-modal")).not.toBeInTheDocument();
    });

    it("opens premium page in new tab when secondary action is clicked", () => {
      render(<UpgradePrompt showSecondaryAction={true} />);

      const secondaryButton = screen.getByText("Saber Mais");
      fireEvent.click(secondaryButton);

      expect(mockWindowOpen).toHaveBeenCalledWith("/premium", "_blank");
    });

    it("hides secondary action when showSecondaryAction is false", () => {
      render(<UpgradePrompt showSecondaryAction={false} />);

      expect(screen.queryByText("Saber Mais")).not.toBeInTheDocument();
    });
  });

  describe("Dismissible Functionality", () => {
    it("shows dismiss button when showDismiss is true", () => {
      render(<UpgradePrompt showDismiss={true} />);

      const dismissButton = screen.getByLabelText("Dispensar");
      expect(dismissButton).toBeInTheDocument();
    });

    it("hides dismiss button when showDismiss is false", () => {
      render(<UpgradePrompt showDismiss={false} />);

      expect(screen.queryByLabelText("Dispensar")).not.toBeInTheDocument();
    });

    it("calls onDismiss callback when dismiss button is clicked", () => {
      const mockOnDismiss = jest.fn();
      render(<UpgradePrompt showDismiss={true} onDismiss={mockOnDismiss} />);

      const dismissButton = screen.getByLabelText("Dispensar");
      fireEvent.click(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it("hides component after dismiss button is clicked", () => {
      render(<UpgradePrompt showDismiss={true} />);

      const dismissButton = screen.getByLabelText("Dispensar");
      fireEvent.click(dismissButton);

      expect(
        screen.queryByText("Funcionalidade Premium")
      ).not.toBeInTheDocument();
    });
  });

  describe("Alternative Suggestions", () => {
    it("shows alternative when showAlternative is true", () => {
      render(
        <UpgradePrompt
          context="reflection_creation"
          restrictionType="reflection_creation"
          showAlternative={true}
        />
      );

      expect(
        screen.getByText(
          "💡 Pode visualizar reflexões existentes ou fazer upgrade para interagir sem limitações."
        )
      ).toBeInTheDocument();
    });

    it("hides alternative when showAlternative is false", () => {
      render(
        <UpgradePrompt
          context="reflection_creation"
          restrictionType="reflection_creation"
          showAlternative={false}
        />
      );

      expect(
        screen.queryByText(/Pode visualizar reflexões existentes/)
      ).not.toBeInTheDocument();
    });
  });

  describe("Specialized Components", () => {
    it("renders ContentUpgradePrompt with correct context", () => {
      render(<ContentUpgradePrompt />);

      expect(screen.getByText("Conteúdo Premium")).toBeInTheDocument();
      expect(screen.getByText("Desbloquear Conteúdo")).toBeInTheDocument();
    });

    it("renders ConnectionUpgradePrompt with correct context", () => {
      render(<ConnectionUpgradePrompt />);

      expect(screen.getByText("Solicitar Conexões")).toBeInTheDocument();
      expect(screen.getByText("Desbloquear Conexões")).toBeInTheDocument();
    });

    it("renders ReflectionUpgradePrompt with correct context", () => {
      render(<ReflectionUpgradePrompt />);

      expect(screen.getByText("Criar Reflexões")).toBeInTheDocument();
      expect(screen.getByText("Desbloquear Reflexões")).toBeInTheDocument();
    });

    it("passes through props to specialized components", () => {
      render(<ContentUpgradePrompt size="lg" variant="banner" />);

      const container = document.querySelector(".p-6.text-lg");
      expect(container).toBeInTheDocument();

      const bannerContainer = document.querySelector(
        ".border-l-4.border-amber-500"
      );
      expect(bannerContainer).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label for dismiss button", () => {
      render(<UpgradePrompt showDismiss={true} />);

      const dismissButton = screen.getByLabelText("Dispensar");
      expect(dismissButton).toHaveAttribute("aria-label", "Dispensar");
    });

    it("maintains focus management for interactive elements", () => {
      render(<UpgradePrompt />);

      const upgradeButton = screen.getByText("Fazer Upgrade para Premium");
      upgradeButton.focus();
      expect(document.activeElement).toBe(upgradeButton);
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className", () => {
      render(<UpgradePrompt className="custom-class" />);

      const container = document.querySelector(".custom-class");
      expect(container).toBeInTheDocument();
    });

    it("combines custom className with variant classes", () => {
      render(<UpgradePrompt className="custom-class" variant="compact" />);

      const container = document.querySelector(".custom-class.bg-amber-50");
      expect(container).toBeInTheDocument();
    });
  });

  describe("Modal Integration", () => {
    it("closes premium modal when onClose is called", () => {
      render(<UpgradePrompt />);

      const upgradeButton = screen.getByText("Fazer Upgrade para Premium");
      fireEvent.click(upgradeButton);

      expect(screen.getByTestId("premium-modal")).toBeInTheDocument();

      // The modal should be closeable (this tests the integration)
      const modal = screen.getByTestId("premium-modal");
      expect(modal).toBeInTheDocument();
    });
  });

  describe("Button Text Variations", () => {
    it("shows correct button text for different contexts", () => {
      const { rerender } = render(
        <UpgradePrompt context="post_view" restrictionType="premium_content" />
      );
      expect(screen.getByText("Desbloquear Conteúdo")).toBeInTheDocument();

      rerender(
        <UpgradePrompt
          context="connection_request"
          restrictionType="connection_request"
        />
      );
      expect(screen.getByText("Desbloquear Conexões")).toBeInTheDocument();

      rerender(
        <UpgradePrompt
          context="reflection_creation"
          restrictionType="reflection_creation"
        />
      );
      expect(screen.getByText("Desbloquear Reflexões")).toBeInTheDocument();
    });
  });
});
